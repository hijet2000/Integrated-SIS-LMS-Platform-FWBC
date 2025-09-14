import {
    bookApi,
    bookIssueApi,
    libraryMemberApi,
    digitalAssetApi,
    getDigitalAssetById,
    getDigitalViewToken,
    logDigitalAudit,
    catchupClassApi,
    listCatchupClasses,
    getCatchupClassById,
    getCatchupPlaybackToken,
    postWatchBeat,
    postPromptAck,
    submitCatchupQuiz,
    finalizeCatchup,
} from './sisApi';

export const listBooks = (siteId: string) => bookApi.get(siteId);

export const libraryApiService = {
    listBooks: bookApi.get,
    addBook: bookApi.add,
    updateBook: bookApi.update,
    deleteBook: bookApi.delete,
    
    listMembers: libraryMemberApi.get,
    addMember: libraryMemberApi.add,
    updateMember: libraryMemberApi.update,
    deleteMember: libraryMemberApi.delete,

    listIssues: bookIssueApi.get,
    addIssue: bookIssueApi.add,
    updateIssue: bookIssueApi.update,

    listDigitalAssets: digitalAssetApi.get,
    getDigitalAsset: getDigitalAssetById,
    getDigitalViewToken: getDigitalViewToken,
    logDigitalAudit: logDigitalAudit,

    listCatchupClasses: listCatchupClasses,
    getCatchupClass: getCatchupClassById,
    getCatchupToken: getCatchupPlaybackToken,
    postWatchBeat: postWatchBeat,
    postPromptAck: postPromptAck,
    submitQuiz: submitCatchupQuiz,
    finalizeCatchup: finalizeCatchup,
};
