
import React, { useState, useEffect, useMemo } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import {
    getCatchupPlaybackToken,
    postWatchBeat,
    postPromptAck,
    submitCatchupQuiz,
    finalizeCatchup,
// FIX: Corrected import path for sisApi
} from '@/services/sisApi';
// FIX: Corrected import path for domain types.
import type { CatchupPlaybackToken, CatchupPrompt, CatchupQuiz } from '@/types';
import Spinner from '@/components/ui/Spinner';
import ErrorState from '@/components/ui/ErrorState';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
// FIX: Add missing imports for Card and CardContent.
import Card, { CardContent } from '@/components/ui/Card';

type PlayerStatus = 'loading' | 'playing' | 'paused' | 'prompt' | 'quiz' | 'finished' | 'credited' | 'failed';

const CatchupPlayer: React.FC<{ catchupId: string }> = ({ catchupId }) => {
    // API Data
    const { data: token, isLoading, isError, error } = useQuery<CatchupPlaybackToken, Error>({
        queryKey: ['catchupToken', catchupId],
        queryFn: () => getCatchupPlaybackToken(catchupId),
    });

    // Player State
    const [status, setStatus] = useState<PlayerStatus>('loading');
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [lastVerifiedPosition, setLastVerifiedPosition] = useState(0);
    
    // Interaction State
    const [activePrompt, setActivePrompt] = useState<CatchupPrompt | null>(null);
    const [promptTimer, setPromptTimer] = useState(15);
    const [acknowledgedPrompts, setAcknowledgedPrompts] = useState<Set<string>>(new Set());
    const [quizAnswers, setQuizAnswers] = useState<number[]>([]);
    const [quizResult, setQuizResult] = useState<{ passed: boolean; scorePct: number } | null>(null);

    // Mutations
    const watchBeatMutation = useMutation({ mutationFn: (payload: { posSec: number; deltaSec: number }) => postWatchBeat(catchupId, payload) });
    const promptAckMutation = useMutation({ mutationFn: (promptId: string) => postPromptAck(promptId) });
    // FIX: Correctly type the mutation result.
    const quizMutation = useMutation< { passed: boolean; scorePct: number }, Error, number[]>({ mutationFn: (answers: number[]) => submitCatchupQuiz(catchupId, answers) });
    // FIX: Correctly type the mutation result.
    const finalizeMutation = useMutation<{ credited: boolean }, Error>({ mutationFn: () => finalizeCatchup(catchupId) });

    // Memos
    const rules = useMemo(() => token?.rules || { minPct: 80, allowFwdWindowSec: 10 }, [token]);
    const prompts = useMemo(() => token?.prompts || [], [token]);
    const quiz = useMemo(() => token?.quiz, [token]);

    // Effects
    useEffect(() => {
        if (token) {
            // This would come from the video player's metadata
            const videoDuration = token.src === 'M-V4sRsG-o8' ? 300 : 450;
            setDuration(videoDuration);
            setStatus('paused');
        }
    }, [token]);

    // Simulated video playback timer
    useEffect(() => {
        if (status !== 'playing') return;
        
        const timer = setInterval(() => {
            setCurrentTime(prev => {
                const nextTime = prev + 1;
                if (nextTime >= duration) {
                    setStatus(quiz ? 'quiz' : 'finished');
                    return duration;
                }
                return nextTime;
            });
        }, 1000);
        return () => clearInterval(timer);
    }, [status, duration, quiz]);

    // Watch beat timer
    useEffect(() => {
        if (status !== 'playing') return;
        const beatTimer = setInterval(() => {
            watchBeatMutation.mutate({ posSec: currentTime, deltaSec: 10 });
            setLastVerifiedPosition(p => Math.max(p, currentTime));
        }, 10000);
        return () => clearInterval(beatTimer);
    }, [status, currentTime, watchBeatMutation]);
    
    // Prompt checker
    useEffect(() => {
        const nextPrompt = prompts.find(p => currentTime >= p.atSec && !acknowledgedPrompts.has(p.id));
        if (nextPrompt) {
            setStatus('prompt');
            // FIX: The activePrompt state requires a `catchupId`, which is missing from the prompt object in the token.
            setActivePrompt({ ...nextPrompt, catchupId });
            setPromptTimer(15);
        }
    }, [currentTime, prompts, acknowledgedPrompts, catchupId]);
    
    // Prompt countdown timer
    useEffect(() => {
        if (status !== 'prompt') return;
        const timer = setInterval(() => {
            setPromptTimer(prev => {
                if (prev <= 1) {
                    setStatus('failed');
                    finalizeMutation.mutate(); // Log failure
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
        return () => clearInterval(timer);
    }, [status, finalizeMutation]);
    
    // Check for finalization
    useEffect(() => {
        if (status === 'finished') {
            // FIX: `mutate` returns void. Use `mutateAsync` to get a promise that resolves with the mutation result.
            finalizeMutation.mutateAsync().then(res => {
                setStatus(res.credited ? 'credited' : 'failed');
            });
        }
    }, [status, finalizeMutation]);


    // Handlers
    const handleSeek = (time: number) => {
        const fwdLimit = lastVerifiedPosition + rules.allowFwdWindowSec;
        const newTime = Math.min(time, fwdLimit);
        setCurrentTime(newTime);
    };

    const handleAcknowledgePrompt = () => {
        if (!activePrompt) return;
        promptAckMutation.mutate(activePrompt.id);
        setAcknowledgedPrompts(prev => new Set(prev).add(activePrompt.id));
        setActivePrompt(null);
        setStatus('playing');
    };
    
    const handleQuizSubmit = () => {
        if (!quiz) return;
        // FIX: `mutate` returns void. Use `mutateAsync` to get a promise that resolves with the mutation result.
        quizMutation.mutateAsync(quizAnswers).then(result => {
            setQuizResult(result);
            if (result.passed) {
                setStatus('finished');
            }
        });
    };

    if (isLoading) return <div className="flex justify-center p-8"><Spinner/></div>;
    if (isError) return <ErrorState title="Playback Error" message={error.message}/>;

    const progressPct = duration > 0 ? (currentTime / duration) * 100 : 0;
    const isComplete = progressPct >= rules.minPct && acknowledgedPrompts.size === prompts.length;

    return (
        <Card>
            <CardContent>
                <div className="aspect-video bg-black flex items-center justify-center text-white relative">
                    {token?.host === 'YOUTUBE' ? `(YouTube Player for ID: ${token.src})` : '(HLS Player)'}
                    {status === 'credited' && <div className="absolute inset-0 bg-green-900/80 flex flex-col items-center justify-center"><h3 className="text-3xl font-bold">Attendance Credited!</h3></div>}
                    {status === 'failed' && <div className="absolute inset-0 bg-red-900/80 flex flex-col items-center justify-center"><h3 className="text-3xl font-bold">Credit Failed</h3><p>Conditions not met.</p></div>}
                </div>
                {/* Progress Bar */}
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5 mt-4" onClick={e => {
                     const rect = e.currentTarget.getBoundingClientRect();
                     const clickX = e.clientX - rect.left;
                     const time = (clickX / rect.width) * duration;
                     handleSeek(time);
                }}>
                    <div className="bg-indigo-600 h-2.5 rounded-full" style={{ width: `${progressPct}%` }}></div>
                </div>
                {/* Controls */}
                <div className="flex justify-between items-center mt-2">
                    <Button onClick={() => setStatus(status === 'playing' ? 'paused' : 'playing')} disabled={status !== 'playing' && status !== 'paused'}>
                        {status === 'playing' ? 'Pause' : 'Play'}
                    </Button>
                    <span className="text-sm font-mono">{new Date(currentTime * 1000).toISOString().substr(14, 5)} / {new Date(duration * 1000).toISOString().substr(14, 5)}</span>
                    <span className={`text-sm font-bold ${isComplete ? 'text-green-500' : 'text-yellow-500'}`}>
                        {isComplete ? 'Criteria Met' : 'In Progress'}
                    </span>
                </div>
            </CardContent>

            {/* Prompt Modal */}
            <Modal isOpen={status === 'prompt'} onClose={() => {}} title="Presence Check">
                <div className="text-center">
                    <p className="text-lg">{activePrompt?.text}</p>
                    <p className="text-3xl font-bold my-4">{promptTimer}</p>
                    <Button size="lg" onClick={handleAcknowledgePrompt}>Confirm</Button>
                </div>
            </Modal>
            
             {/* Quiz Modal */}
            <Modal isOpen={status === 'quiz'} onClose={() => {}} title="End of Class Quiz" footer={quizResult === null ? <Button onClick={handleQuizSubmit}>Submit Quiz</Button> : undefined}>
                {quiz && quizResult === null && (
                    <div className="space-y-6">
                        {quiz.questions.items.map((q, qIndex) => (
                            <div key={qIndex}>
                                <p className="font-semibold">{qIndex + 1}. {q.q}</p>
                                <div className="mt-2 space-y-2">
                                    {q.options.map((opt, oIndex) => (
                                        <label key={oIndex} className="flex items-center">
                                            <input type="radio" name={`q-${qIndex}`} checked={quizAnswers[qIndex] === oIndex} onChange={() => {
                                                const newAnswers = [...quizAnswers];
                                                newAnswers[qIndex] = oIndex;
                                                setQuizAnswers(newAnswers);
                                            }} className="mr-2"/> {opt}
                                        </label>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
                 {quizResult && (
                    <div className="text-center">
                        <h3 className={`text-2xl font-bold ${quizResult.passed ? 'text-green-600' : 'text-red-600'}`}>
                            {quizResult.passed ? 'Quiz Passed!' : 'Quiz Failed'}
                        </h3>
                        <p>Your score: {quizResult.scorePct}%</p>
                        {!quizResult.passed && <p className="mt-2 text-sm">Please review the material and contact your teacher.</p>}
                    </div>
                )}
            </Modal>
        </Card>
    );
};

export default CatchupPlayer;