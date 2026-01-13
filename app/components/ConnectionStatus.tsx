import { Spinner } from './ui/spinner';

interface ConnectionStatusProps {
  status: 'connecting' | 'connected' | 'disconnected' | 'reconnecting';
}

export default function ConnectionStatus({ status }: ConnectionStatusProps) {
  if (status === 'connected') return null;

  const messages = {
    connecting: 'Connecting to server...',
    reconnecting: 'Waking up server on Render... This may take 30-60 seconds',
    disconnected: 'Reconnecting...'
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-8 shadow-xl flex flex-col items-center gap-4 max-w-md mx-4">
        <Spinner size="lg" className="text-blue-600 dark:text-blue-400" />
        <div className="text-center">
          <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-gray-100">
            {status === 'reconnecting' ? 'Waking Server...' : 'Connecting...'}
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {messages[status as keyof typeof messages]}
          </p>
          {status === 'reconnecting' && (
            <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">
              Free tier servers sleep after inactivity. Please wait while we wake it up.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
