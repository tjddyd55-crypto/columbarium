interface StatusBadgeProps {
  status: string;
}

export default function StatusBadge({ status }: StatusBadgeProps) {
  const getVariant = (status: string) => {
    const statusLower = status.toLowerCase();
    if (statusLower.includes('active') || statusLower.includes('활성') || statusLower.includes('완료') || statusLower.includes('승인')) {
      return 'bg-green-100 text-green-800';
    }
    if (statusLower.includes('pending') || statusLower.includes('대기') || statusLower.includes('판매')) {
      return 'bg-yellow-100 text-yellow-800';
    }
    if (statusLower.includes('rejected') || statusLower.includes('반려') || statusLower.includes('취소')) {
      return 'bg-red-100 text-red-800';
    }
    if (statusLower.includes('completed') || statusLower.includes('거래완료')) {
      return 'bg-blue-100 text-blue-800';
    }
    return 'bg-gray-100 text-gray-800';
  };

  return (
    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getVariant(status)}`}>
      {status}
    </span>
  );
}
