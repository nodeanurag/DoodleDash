import { useState } from 'react';
import { Pencil, Plus, Dices, ChevronDown, RotateCw, Clock, Target, Globe } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const AVATAR_STYLES = [
  { id: 'croodles', name: 'Doodles' },
  { id: 'bottts', name: 'Robots' },
  { id: 'adventurer', name: 'Adventurers' },
  { id: 'fun-emoji', name: 'Emojis' }
];
