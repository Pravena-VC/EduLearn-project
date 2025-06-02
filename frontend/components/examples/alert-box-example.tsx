// This component demonstrates a proper JavaScript Alert Box implementation
"use client";

import { Button } from "@/components/ui/button";
import { useState } from "react";

export default function AlertBoxExample() {
  const [clicked, setClicked] = useState(false);

  const handleClick = () => {
    alert("This is an alert message!");
    setClicked(true);
  };

  return (
    <div className="p-8 max-w-md mx-auto bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4">JavaScript Alert Box Example</h2>
      <p className="mb-4">Click the button below to see an alert message:</p>

      <Button onClick={handleClick} className="w-full mb-4">
        Show Alert
      </Button>

      {clicked && (
        <div className="p-3 bg-green-100 text-green-800 rounded">
          <p>Great! You've triggered the alert.</p>
          <p className="text-xs mt-1">
            Click the button again to show it once more.
          </p>
        </div>
      )}

      <div className="mt-6 p-4 bg-gray-100 rounded-md">
        <h3 className="text-lg font-semibold mb-2">Code Example:</h3>
        <pre className="text-sm overflow-x-auto p-3 bg-black text-white rounded">
          {`// HTML Part
<button id="alertButton">Show Alert</button>

// JavaScript Part
document.getElementById("alertButton").addEventListener("click", function() {
  alert("This is an alert message!");
});`}
        </pre>
      </div>
    </div>
  );
}
