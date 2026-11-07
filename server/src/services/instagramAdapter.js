/**
 * server/src/services/instagramAdapter.js
 * Adaptador oficial para publicação de Stories via Instagram Graph API.
 * 
 * Regra obrigatória: NUNCA simular sucesso quando não houver tokens configurados.
 * Retorna estado 'nao_configurado' claro para permitir download e compartilhamento manual.
 */

export function getInstagramConfigStatus() {
  const token = process.env.INSTAGRAM_ACCESS_TOKEN;
  const accountId = process.env.INSTAGRAM_ACCOUNT_ID;

  const isConfigured = Boolean(token && token.trim() !== '' && accountId && accountId.trim() !== '');

  return {
    configured: isConfigured,
    status: isConfigured ? 'conectado' : 'nao_configurado',
    accountId: isConfigured ? accountId : null,
    message: isConfigured 
      ? 'Instagram Graph API configurada para publicação de Stories.'
      : 'Integração com Instagram não configurada. Defina INSTAGRAM_ACCESS_TOKEN e INSTAGRAM_ACCOUNT_ID no ambiente. O lojista pode baixar a arte e compartilhar manualmente.'
  };
}

/**
 * Envia story para a fila ou publica caso configurado
 */
export async function dispatchInstagramStory({ imageUrl, vehicleId, caption = '' }) {
  const config = getInstagramConfigStatus();

  if (!config.configured) {
    return {
      success: false,
      status: 'nao_configurado',
      vehicleId,
      message: config.message,
      canManualShare: true
    };
  }

  try {
    // Chamada oficial à API do Instagram Graph (Meta)
    // 1. Criar container de mídia tipo STORIES
    const containerUrl = `https://graph.facebook.com/v19.0/${process.env.INSTAGRAM_ACCOUNT_ID}/media`;
    const containerParams = new URLSearchParams({
      media_type: 'STORIES',
      image_url: imageUrl,
      caption,
      access_token: process.env.INSTAGRAM_ACCESS_TOKEN
    });

    const createRes = await fetch(`${containerUrl}?${containerParams.toString()}`, {
      method: 'POST'
    });

    const createData = await createRes.json();
    if (!createRes.ok || !createData.id) {
      return {
        success: false,
        status: 'erro',
        vehicleId,
        error: createData.error?.message || 'Falha ao criar container no Instagram Graph API'
      };
    }

    // 2. Publicar container criado
    const publishUrl = `https://graph.facebook.com/v19.0/${process.env.INSTAGRAM_ACCOUNT_ID}/media_publish`;
    const publishParams = new URLSearchParams({
      creation_id: createData.id,
      access_token: process.env.INSTAGRAM_ACCESS_TOKEN
    });

    const publishRes = await fetch(`${publishUrl}?${publishParams.toString()}`, {
      method: 'POST'
    });
    const publishData = await publishRes.json();

    if (!publishRes.ok || !publishData.id) {
      return {
        success: false,
        status: 'erro',
        vehicleId,
        error: publishData.error?.message || 'Falha na publicação do Story'
      };
    }

    return {
      success: true,
      status: 'publicado',
      externalMediaId: publishData.id,
      vehicleId,
      publishedAt: new Date().toISOString()
    };
  } catch (err) {
    return {
      success: false,
      status: 'erro',
      vehicleId,
      error: err.message
    };
  }
}
