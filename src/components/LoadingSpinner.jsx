const LoadingSpinner = ({ size = 'md', fullScreen = false }) => {
  const sizes = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16'
  };

  const spinner = (
    <div className="flex items-center justify-center">
      <div className={`${sizes[size]} border-4 border-gray-700 border-t-amber-500 rounded-full animate-spin`}></div>
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-gray-950/80 backdrop-blur-sm z-[9999] flex flex-col items-center justify-center">
        <div className={`${sizes[size]} border-4 border-gray-700 border-t-amber-500 rounded-full animate-spin mb-4`}></div>
        <p className="text-gray-400 text-sm">Yükleniyor...</p>
      </div>
    );
  }

  return spinner;
};

export default LoadingSpinner;
