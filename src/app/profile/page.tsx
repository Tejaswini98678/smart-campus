'use client';

import React from 'react';
import ProfileSection from '@/components/ProfileSection';

export default function ProfilePage() {
  return (
    <div className="page-container px-8 py-10 overflow-y-auto w-full">
      <div className="max-w-[1000px] mx-auto">
        <ProfileSection />
      </div>
    </div>
  );
}
