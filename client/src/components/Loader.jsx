import './Loader.css';

const Loader = () => {
  return (
    <div className="loader-container">
      <div className="loader">
        <div className="box">
          <div className="top-side"></div>
          <div className="bottom-side"></div>
          <div className="screen">
            <div className="lightray-limit"><div className="lightray"></div></div>
            <div className="loader-box"><div className="progress"></div></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Loader;
