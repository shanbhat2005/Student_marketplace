import './SkeletonCard.css';

const SkeletonCard = () => {
  return (
    <div className="card skeleton-card">
      <div className="skeleton skeleton-img"></div>
      <div className="skeleton skeleton-title"></div>
      <div className="skeleton skeleton-text" style={{ width: '60%' }}></div>
      <div className="skeleton skeleton-text" style={{ width: '40%' }}></div>
      <div className="skeleton skeleton-btn"></div>
    </div>
  );
};

export default SkeletonCard;
