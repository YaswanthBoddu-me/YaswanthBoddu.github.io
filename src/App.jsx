
import React from 'react'
import './index.css'

function App() {
  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="max-w-md w-full p-6 bg-white rounded-lg shadow-lg">
        <h1 className="text-2xl font-bold text-gray-800 mb-4">Tailwind CSS is working!</h1>
        <p className="text-gray-600">This component is styled using Tailwind CSS classes.</p>
        <button className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors">
          Button Example
        </button>
      </div>
    </div>
  )
}

export default App
