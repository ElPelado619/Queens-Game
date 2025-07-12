/*
/// <reference types="vite/client" />

// Declare modules for CSS files
declare module '*.css' {
  const css: { [key: string]: string };
  export default css;
}

// Declare modules for SVG files
declare module '*.svg' {
  import React = require('react'); // If you're using React, otherwise remove this line
  const content: string; // Or React.FC<React.SVGProps<SVGSVGElement>> if using React SVG components
  export default content;
}

declare module '*.png';
declare module '*.jpg';
declare module '*.jpeg';
declare module '*.gif';
*/