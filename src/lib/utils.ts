export const getExpirationStatus = (dateString: string) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const expireDate = new Date(dateString);
  expireDate.setHours(0, 0, 0, 0);

  const diffTime = expireDate.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays < 0) return { label: "已過期", color: "text-red-600 bg-red-100" };
  if (diffDays <= 3) return { label: `${diffDays} 天後過期`, color: "text-orange-600 bg-orange-100" };
  return { label: `還有 ${diffDays} 天過期`, color: "text-green-600 bg-green-100" };
};
