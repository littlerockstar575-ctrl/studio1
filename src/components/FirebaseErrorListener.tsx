
'use client';

import { useState, useEffect } from 'react';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';

/**
 * An invisible component that listens for globally emitted 'permission-error' events.
 * It catches the detailed error and immediately throws it, allowing Next.js's
 * global error boundary (`global-error.tsx`) to catch it and display a rich error overlay
 * during development. This is the key to the debug loop.
 */
export function FirebaseErrorListener() {
  // We don't need to store the error in state. The goal is to throw it immediately
  // upon receiving it from the emitter.
  
  useEffect(() => {
    // The callback now expects a strongly-typed error.
    const handleError = (error: FirestorePermissionError) => {
      // When the 'permission-error' event is emitted, this function runs.
      // We immediately throw the error. In a Next.js development environment,
      // this will be caught by the framework's error overlay, displaying
      // the full error details, including the stack trace and the rich,
      // contextual message from FirestorePermissionError.
      throw error;
    };

    // Subscribe to the event when the component mounts.
    errorEmitter.on('permission-error', handleError);

    // Unsubscribe on unmount to prevent memory leaks.
    return () => {
      errorEmitter.off('permission-error', handleError);
    };
  }, []); // The empty dependency array ensures this effect runs only once.

  // This component renders nothing to the DOM. Its only purpose is to
  // listen for events and trigger the error overlay.
  return null;
}
