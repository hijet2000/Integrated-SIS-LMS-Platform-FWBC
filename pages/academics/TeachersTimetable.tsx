
import React, { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useParams } from 'react-router-dom';
import PageHeader from '@/components/ui/PageHeader';
import Spinner from '@/components/ui/Spinner';
import ErrorState from '@/components/ui/ErrorState';
import EmptyState from '@/components/ui/EmptyState';
import Card, { CardContent, CardHeader } from '@/components/ui/Card';
import { useCan } from '@/hooks/useCan';
// FIX: Correct import path for sisApi
import { getTeachers, getTimet