import React from "react";

export default function Loader() {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm z-50">
      <div className="flex flex-col items-center">
        <div className="relative h-16 w-16">
          <div className="absolute inset-0 rounded-full border-4 border-t-primary border-r-transparent border-b-transparent border-l-transparent animate-spin"></div>
          <div className="absolute inset-2 rounded-full border-4 border-r-primary border-t-transparent border-b-transparent border-l-transparent animate-spin animation-delay-200"></div>
          <div className="absolute inset-4 rounded-full border-4 border-b-primary border-t-transparent border-r-transparent border-l-transparent animate-spin animation-delay-400"></div>
        </div>
        <p className="mt-4 text-muted-foreground">Loading...</p>
      </div>
    </div>
  );
}