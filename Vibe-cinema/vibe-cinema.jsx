import React, { useState, useRef, useEffect } from 'react';
import { Film, Popcorn, Ticket, RefreshCw, Star, Sparkles, Send, Clapperboard, Loader2, PlayCircle, ExternalLink, ChevronRight, ChevronLeft } from 'lucide-react';

const MoviePicker = () => {
  const [userInput, setUserInput] = useState('');
  const [movies, setMovies] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const inputRef = useRef(null);
  const scrollContainerRef = useRef(null);

  // Focus input on load
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  const generateMovieRecommendation = async (promptText) => {
    setIsLoading(true);
    setError(null);
    setMovies(null);
    setActiveIndex(0);

    const apiKey = ""; // Runtime environment provides this
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${apiKey}`;

    // Instruct AI to return a list of 5
    const systemInstruction = `
      You are a cinematic expert AI. 
      Your goal is to recommend Top 5 movies based on the user's emotional state or specific request.
      
      RULES:
      1. Return ONLY a valid JSON object with a single key "recommendations" which is an array of 5 movie objects.
      2. Each movie object must have: "title", "year", "rating" (1-10 string), "desc" (2-sentence summary), "genre", "reason" (why it fits), "mood_color" (a hex code string representing the movie's vibe, e.g. "#FF0000" for horror).
      3. Provide a diverse mix (e.g., one classic, one modern, one indie if applicable).
      4. Do not include markdown formatting.
    `;

    const payload = {
      contents: [{ parts: [{ text: promptText }] }],
      systemInstruction: { parts: [{ text: systemInstruction }] },
      generationConfig: {
        responseMimeType: "application/json"
      }
    };

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!response.ok) throw new Error(`API Error: ${response.status}`);

      const data = await response.json();
      const textResult = data.candidates?.[0]?.content?.parts?.[0]?.text;

      if (textResult) {
        const parsedData = JSON.parse(textResult);
        if (parsedData.recommendations && Array.isArray(parsedData.recommendations)) {
           setMovies(parsedData.recommendations);
        } else {
           throw new Error("Invalid format received");
        }
      } else {
        throw new Error("No movies found.");
      }

    } catch (err) {
      console.error(err);
      setError("The popcorn machine jammed! (AI Request Failed). Try again?");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!userInput.trim()) return;
    generateMovieRecommendation(userInput);
  };

  const reset = () => {
    setMovies(null);
    setUserInput('');
    setTimeout(() => inputRef.current?.focus(), 100);
  };

  const openStreamingSearch = (title) => {
    const query = encodeURIComponent(`watch ${title} movie online`);
    window.open(`https://www.google.com/search?q=${query}`, '_blank');
  };

  const scrollToCard = (index) => {
    setActiveIndex(index);
    if (scrollContainerRef.current) {
      const cardWidth = scrollContainerRef.current.children[0].offsetWidth;
      scrollContainerRef.current.scrollTo({
        left: index * (cardWidth + 24), // 24 is gap
        behavior: 'smooth'
      });
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col font-sans selection:bg-purple-500 selection:text-white overflow-x-hidden">
      {/* Header */}
      <header className="p-6 border-b border-gray-800 flex items-center justify-center md:justify-between sticky top-0 bg-gray-900/95 backdrop-blur z-50 shadow-xl">
        <div className="flex items-center space-x-2 cursor-pointer" onClick={reset}>
          <div className="bg-purple-600 p-2 rounded-lg shadow-lg shadow-purple-900/20">
            <Sparkles size={24} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent">
            VibeCinema
          </h1>
        </div>
        <div className="hidden md:flex items-center space-x-4 text-sm text-gray-400">
          <span>AI Powered</span>
          <div className="w-px h-4 bg-gray-700"></div>
          <span>Top 5 Picks</span>
        </div>
      </header>

      <main className="flex-grow flex flex-col items-center justify-center p-4 md:p-8 max-w-6xl mx-auto w-full relative">
        
        {/* Search Input Section - Only show if no movies selected */}
        {!movies && !isLoading && (
          <div className="w-full max-w-2xl animate-fade-in">
            <div className="text-center mb-8">
              <h2 className="text-4xl md:text-5xl font-extrabold mb-4 leading-tight">
                How are you <span className="text-purple-500">feeling?</span>
              </h2>
              <p className="text-gray-400 text-lg">
                Describe your mood, a specific plot, or a vague desire.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="relative w-full group z-10">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl blur opacity-30 group-hover:opacity-75 transition duration-500"></div>
              <div className="relative flex items-center bg-gray-800 rounded-2xl border border-gray-700 p-2">
                <input
                  ref={inputRef}
                  type="text"
                  value={userInput}
                  onChange={(e) => setUserInput(e.target.value)}
                  placeholder="e.g., 'I just broke up and need to cry' or 'Sci-fi with mind-bending twists'"
                  className="w-full bg-transparent text-white text-lg p-4 placeholder-gray-500 focus:outline-none"
                />
                <button 
                  type="submit"
                  disabled={!userInput.trim()}
                  className="bg-purple-600 hover:bg-purple-500 text-white p-3 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 active:scale-95"
                >
                  <Send size={24} />
                </button>
              </div>
            </form>

            {/* Suggestion Chips */}
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              {[
                "Dark Comedy like Parasite",
                "80s Adventure Movie",
                "Cyberpunk Anime",
                "Slow-burn Mystery",
                "Feel-good Road Trip"
              ].map((suggestion, idx) => (
                <button 
                  key={idx}
                  onClick={() => {
                    setUserInput(suggestion);
                    generateMovieRecommendation(suggestion);
                  }}
                  className="text-sm bg-gray-800 hover:bg-gray-700 border border-gray-700 text-gray-300 py-2 px-4 rounded-full transition-colors"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Loading State */}
        {isLoading && (
          <div className="flex flex-col items-center justify-center animate-pulse text-center">
            <div className="relative mb-8">
              <div className="absolute inset-0 bg-purple-500 blur-xl opacity-20 rounded-full"></div>
              <Loader2 className="text-purple-500 animate-spin relative z-10" size={64} />
            </div>
            <h3 className="text-2xl font-bold text-white mb-2">Curating your lineup...</h3>
            <p className="text-gray-400 italic max-w-md">
              "{userInput}"
            </p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-red-900/20 border border-red-500/50 text-red-200 p-6 rounded-xl text-center max-w-md animate-fade-in">
            <p className="mb-4 text-lg">{error}</p>
            <button 
              onClick={() => setIsLoading(false)}
              className="bg-red-600 hover:bg-red-500 text-white py-2 px-6 rounded-lg transition-colors"
            >
              Try Again
            </button>
          </div>
        )}

        {/* Results - Carousel Layout */}
        {movies && !isLoading && (
          <div className="w-full animate-scale-in flex flex-col items-center">
            
            <div className="flex justify-between items-center w-full mb-6 px-4">
               <h2 className="text-xl font-semibold text-gray-300">Top 5 Recommendations</h2>
               <button onClick={reset} className="text-sm text-purple-400 hover:text-purple-300 flex items-center">
                  <RefreshCw size={14} className="mr-1"/> New Search
               </button>
            </div>

            {/* Carousel Container */}
            <div 
              ref={scrollContainerRef}
              className="w-full overflow-x-auto flex gap-6 pb-8 px-4 snap-x snap-mandatory no-scrollbar"
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
              {movies.map((movie, index) => (
                <div 
                  key={index} 
                  className="snap-center shrink-0 w-full md:w-[600px] bg-gray-800 rounded-2xl shadow-2xl border border-gray-700 overflow-hidden flex flex-col relative group"
                >
                  {/* Dynamic Poster Area */}
                  <div 
                    className="h-48 md:h-64 relative overflow-hidden flex items-end p-6"
                    style={{ 
                      background: `linear-gradient(to top right, #111827, ${movie.mood_color || '#581c87'})` 
                    }}
                  >
                    {/* Abstract pattern overlay */}
                    <div className="absolute inset-0 opacity-20" 
                         style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '24px 24px' }}>
                    </div>
                    
                    <div className="relative z-10 w-full">
                      <div className="flex justify-between items-start mb-2">
                        <span className="bg-black/30 backdrop-blur-md border border-white/10 text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                          {movie.genre}
                        </span>
                        <div className="flex items-center bg-yellow-500 text-gray-900 px-2 py-1 rounded text-xs font-bold shadow-lg">
                          <Star size={12} className="mr-1 fill-current" /> {movie.rating}
                        </div>
                      </div>
                      <h2 className="text-2xl md:text-4xl font-bold leading-tight text-white drop-shadow-lg">
                        {movie.title}
                      </h2>
                      <p className="text-white/80 text-sm mt-1 font-medium flex items-center">
                         <Ticket size={14} className="mr-2"/> {movie.year}
                      </p>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-6 flex-grow flex flex-col">
                    <div className="mb-6 flex-grow">
                      <p className="text-sm text-purple-300 italic mb-2 flex items-start">
                         <Sparkles size={14} className="mr-2 mt-1 flex-shrink-0" /> 
                         "{movie.reason}"
                      </p>
                      <p className="text-gray-300 leading-relaxed">
                        {movie.desc}
                      </p>
                    </div>

                    <div className="mt-auto pt-4 border-t border-gray-700/50">
                       <button 
                          onClick={() => openStreamingSearch(movie.title)}
                          className="w-full bg-white hover:bg-gray-100 text-gray-900 font-bold py-3 px-4 rounded-xl flex items-center justify-center transition-colors shadow-lg"
                        >
                          <PlayCircle size={20} className="mr-2 text-purple-600" />
                          Find Where to Watch
                          <ExternalLink size={14} className="ml-2 opacity-50"/>
                       </button>
                    </div>
                  </div>
                  
                  {/* Number Indicator */}
                  <div className="absolute top-4 right-4 text-6xl font-black text-white/5 pointer-events-none select-none">
                    {index + 1}
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination Dots */}
            <div className="flex space-x-2 mt-2">
              {movies.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => scrollToCard(idx)}
                  className={`w-2 h-2 rounded-full transition-all ${
                    idx === activeIndex ? 'bg-purple-500 w-6' : 'bg-gray-600 hover:bg-gray-500'
                  }`}
                />
              ))}
            </div>
            
            <p className="text-gray-500 text-xs mt-4">
              Swipe or scroll to see all 5 picks
            </p>

          </div>
        )}

      </main>
    </div>
  );
};

export default MoviePicker;