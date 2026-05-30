import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiMinus, FiPlus } from 'react-icons/fi';
import { useCart } from '../context/CartContext';
import { formatPrice } from '../utils/format';
import { toWebpImage } from '../utils/images';
import './ProductCard.css';

const ProductCard = ({ product, compact = false }) => {
  const { addToCart, removeFromCart, updateQuantity, getItemQuantity } = useCart();
  const navigate = useNavigate();
  const quantity = getItemQuantity(product.id);
  const [imageFailed, setImageFailed] = useState(false);
  const isOutOfStock = product.stockNote === 'Out of stock' || product.inStock === false;
  const stockNote = product.stockNote && product.stockNote !== 'In stock' ? product.stockNote : '';
  const productInitials = product.name
    .split(' ')
    .slice(0, 2)
    .map(word => word[0])
    .join('');

  const handleAdd = (e) => {
    e.stopPropagation();
    if (isOutOfStock) return;
    addToCart(product);
  };

  const handleIncrease = (e) => {
    e.stopPropagation();
    updateQuantity(product.id, quantity + 1);
  };

  const handleDecrease = (e) => {
    e.stopPropagation();
    if (quantity <= 1) {
      removeFromCart(product.id);
    } else {
      updateQuantity(product.id, quantity - 1);
    }
  };

  return (
    <div
      className={`product-card ${compact ? 'product-card--compact' : ''}`}
      onClick={() => navigate(`/product/${product.id}`)}
      id={`product-card-${product.id}`}
    >
      {/* Image container */}
      <div className="product-card__image-container">
        {!imageFailed ? (
          <img
            src={toWebpImage(product.image)}
            alt={product.name}
            className="product-card__image"
            loading="lazy"
            onError={() => setImageFailed(true)}
          />
        ) : (
          <div className="product-card__image-fallback" aria-label={product.name}>
            <span>{productInitials}</span>
          </div>
        )}
        {product.discount > 0 && (
          <span className="product-card__discount-badge">
            {product.discount}% OFF
          </span>
        )}
        {stockNote && (
          <span className={`product-card__stock-badge ${isOutOfStock ? 'product-card__stock-badge--out' : ''}`}>
            {stockNote}
          </span>
        )}
      </div>

      {/* Info */}
      <div className="product-card__info">
        <span className="product-card__delivery-badge">
          ⚡ {product.deliveryTime}
        </span>
        <h3 className="product-card__name">{product.name}</h3>
        <p className="product-card__weight">
          {product.weight} {product.unit}
        </p>

        {/* Price + Add button row */}
        <div className="product-card__bottom">
          <div className="product-card__price-group">
            <span className="product-card__price">{formatPrice(product.price)}</span>
            {product.discount > 0 && (
              <span className="product-card__mrp">{formatPrice(product.mrp)}</span>
            )}
          </div>

          {/* Add / Quantity stepper */}
          {isOutOfStock ? (
            <button className="product-card__add-btn product-card__add-btn--disabled" onClick={(e) => e.stopPropagation()}>
              OUT
            </button>
          ) : quantity === 0 ? (
            <button
              className="product-card__add-btn"
              onClick={handleAdd}
              id={`add-btn-${product.id}`}
            >
              ADD
            </button>
          ) : (
            <div className="product-card__stepper" onClick={(e) => e.stopPropagation()}>
              <button
                className="product-card__stepper-btn"
                onClick={handleDecrease}
              >
                <FiMinus />
              </button>
              <span className="product-card__stepper-count">{quantity}</span>
              <button
                className="product-card__stepper-btn"
                onClick={handleIncrease}
              >
                <FiPlus />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
