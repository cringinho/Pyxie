import React from 'react';
import CommandGrid from '../components/wiki/CommandGrid';

export default function Wiki({ t, lang }) {
  return (
    <div className="min-h-screen py-8">
      <CommandGrid t={t} lang={lang} />
    </div>
  );
}
