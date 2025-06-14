// utils/authErrors.ts

export const handleAuthError = (error: any): string => {
  if (!error) return 'Erro desconhecido';

  const errorMessages: Record<string, string> = {
    // Erros de autenticação
    'Invalid login credentials': 'Email ou senha incorretos',
    'User not confirmed': 'Por favor, confirme seu email antes de fazer login',
    'User already registered': 'Este email já está cadastrado',
    'Password should be at least 6 characters': 'A senha deve ter pelo menos 6 caracteres',
    'Unable to validate email address: invalid format': 'Formato de email inválido',
    
    // Erros de permissão
    'new row violates row-level security policy': 'Você não tem permissão para esta ação',
    'permission denied for table': 'Acesso negado',
    
    // Erros de sessão
    'JWT expired': 'Sua sessão expirou. Faça login novamente',
    'Invalid Refresh Token': 'Token inválido. Faça login novamente',
    'Auth session missing!': 'Sessão não encontrada. Faça login novamente',
    
    // Erros de limite
    'Too many requests': 'Muitas tentativas. Aguarde alguns minutos',
    'Email rate limit exceeded': 'Limite de emails excedido. Tente novamente mais tarde',
    'Database error saving new user': 'Erro ao criar usuário. Tente novamente',
    
    // Erros de rede
    'Failed to fetch': 'Erro de conexão. Verifique sua internet',
    'Network request failed': 'Falha na conexão com o servidor',
  };

  // Verifica se é um erro conhecido
  for (const [key, value] of Object.entries(errorMessages)) {
    if (error.message?.includes(key)) {
      return value;
    }
  }

  // Retorna mensagem genérica se não for um erro conhecido
  return error.message || 'Erro ao processar requisição';
};