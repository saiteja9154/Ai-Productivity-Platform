import React from 'react';
import { Card, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { FileText, Sparkles, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

export function Documents() {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full relative z-10">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Link to="/dashboard">
            <Button variant="ghost" size="sm" className="text-slate-400 hover:text-white">
              <ArrowLeft className="h-4 w-4 mr-1" />
              Back
            </Button>
          </Link>
          <div className="h-4 w-px bg-slate-800" />
          <div className="flex items-center space-x-2">
            <FileText className="h-5 w-5 text-indigo-400" />
            <h1 className="text-xl font-bold text-white">Documents Module</h1>
          </div>
        </div>
        <Badge variant="outline" className="border-indigo-500/30 text-indigo-400 bg-indigo-500/10">
          Protected Route ✓
        </Badge>
      </div>

      <Card className="bg-slate-900/80 border-slate-800 shadow-2xl backdrop-blur-md text-center py-16 px-6">
        <CardContent className="space-y-4 max-w-md mx-auto">
          <div className="h-16 w-16 rounded-2xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center mx-auto text-indigo-400 shadow-lg shadow-indigo-500/25">
            <Sparkles className="h-8 w-8" />
          </div>
          <h2 className="text-2xl font-bold text-white tracking-tight">
            Documents Module
          </h2>
          <Badge variant="secondary" className="px-3 py-1 text-xs">
            Coming in Phase 5
          </Badge>
          <p className="text-slate-400 text-sm leading-relaxed">
            Collaborative AI-assisted rich markdown editing, auto-summarization, and version-controlled knowledge documents.
          </p>
          <div className="pt-4 flex justify-center space-x-3">
            <Link to="/dashboard">
              <Button variant="outline" size="sm" className="border-slate-800 text-slate-300">
                Return to Dashboard
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default Documents;
