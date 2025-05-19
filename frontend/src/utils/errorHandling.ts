/**
 * Hjälpfunktioner för att hantera API- och nätverksfel
 */

export const DEFAULT_ERROR_MESSAGE = 'Ett fel inträffade. Försök igen senare.';

export enum ErrorType {
  NETWORK = 'network',
  AUTH = 'auth',
  SERVER = 'server',
  CLIENT = 'client',
  UNKNOWN = 'unknown'
}

/**
 * Analyserar ett API-fel och returnerar lämplig information
 */
export const parseApiError = (error: any): { 
  message: string; 
  type: ErrorType;
  status?: number;
  details?: any;
} => {
  if (!error.response || error.code === 'ECONNABORTED') {
    return {
      message: 'Kunde inte ansluta till servern. Kontrollera din nätverksanslutning.',
      type: ErrorType.NETWORK
    };
  }
  
  const status = error.response.status;
  
  if (status === 401 || status === 403) {
    return {
      message: status === 401 ? 'Ej behörig. Logga in igen.' : 'Tillträde nekad.',
      type: ErrorType.AUTH,
      status
    };
  }
  
  if (status >= 500) {
    return {
      message: 'Ett serverfel inträffade. Vänligen försök igen senare.',
      type: ErrorType.SERVER,
      status,
      details: error.response.data
    };
  }
  
  if (status >= 400) {
    const serverMessage = error.response.data?.detail || 
                       error.response.data?.message ||
                       (typeof error.response.data === 'string' ? error.response.data : null);
    
    return {
      message: serverMessage || `Request misslyckades (${status})`,
      type: ErrorType.CLIENT,
      status,
      details: error.response.data
    };
  }
  
  return {
    message: error.message || DEFAULT_ERROR_MESSAGE,
    type: ErrorType.UNKNOWN,
    details: error
  };
};

/**
 * Loggar felmeddelande med extra information
 */
export const logError = (context: string, error: any): void => {
  console.error(`[${context}] Error:`, error);
  
  if (error.response) {
    console.error(`Status: ${error.response.status}`);
    console.error('Response data:', error.response.data);
  } else if (error.request) {
    console.error('Request made but no response received');
  } else {
    console.error('Error setting up request:', error.message);
  }
};
