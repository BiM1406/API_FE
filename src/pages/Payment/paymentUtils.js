const getLang = () => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('api_fe_language') || 'vi';
  }
  return 'vi';
};

export const formatCurrency = (amount) => {
  const value = Number(amount);

  if (!Number.isFinite(value) || value < 0) {
    return getLang() === 'vi' ? '0đ' : '₫0';
  }

  const lang = getLang();
  if (lang === 'vi') {
    return `${new Intl.NumberFormat('vi-VN').format(value)}đ`;
  } else {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'VND', minimumFractionDigits: 0 }).format(value);
  }
};

export const formatDateTime = (date) => {
  const value = new Date(date);

  if (Number.isNaN(value.getTime())) {
    return '--';
  }

  const lang = getLang();
  return new Intl.DateTimeFormat(lang === 'vi' ? 'vi-VN' : 'en-US', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  }).format(value);
};

export const getRemainingTime = (expiredAt) => {
  const expiredTime = new Date(expiredAt).getTime();
  const totalMs = Number.isNaN(expiredTime) ? 0 : Math.max(0, expiredTime - Date.now());
  const totalSeconds = Math.floor(totalMs / 1000);

  return {
    totalMs,
    minutes: Math.floor(totalSeconds / 60),
    seconds: totalSeconds % 60,
    isExpired: totalMs <= 0
  };
};

export const formatCountdown = (expiredAt) => {
  const remaining = getRemainingTime(expiredAt);

  if (remaining.isExpired) {
    return '00:00';
  }

  return `${String(remaining.minutes).padStart(2, '0')}:${String(remaining.seconds).padStart(2, '0')}`;
};

export const copyToClipboard = async (value) => {
  const text = String(value ?? '');

  if (!text) {
    return false;
  }

  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    }

    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.setAttribute('readonly', '');
    textarea.style.position = 'fixed';
    textarea.style.left = '-9999px';
    document.body.appendChild(textarea);
    textarea.select();
    const copied = document.execCommand('copy');
    document.body.removeChild(textarea);
    return copied;
  } catch {
    return false;
  }
};
