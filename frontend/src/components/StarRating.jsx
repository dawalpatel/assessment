import React, { useState } from 'react';
import { Star } from 'lucide-react';

/**
 * StarRating component
 * @param {number|null} rating Current rating (1-5)
 * @param {function} onRate Callback when a rating is selected
 * @param {boolean} readOnly Whether rating is interactive or display-only
 * @param {number} size Icon size in pixels
 */
const StarRating = ({ rating = 0, onRate, readOnly = false, size = 18 }) => {
  const [hoverRating, setHoverRating] = useState(0);

  const handleClick = (starValue) => {
    if (!readOnly && onRate) {
      onRate(starValue);
    }
  };

  const handleMouseEnter = (starValue) => {
    if (!readOnly) {
      setHoverRating(starValue);
    }
  };

  const handleMouseLeave = () => {
    if (!readOnly) {
      setHoverRating(0);
    }
  };

  const activeValue = hoverRating || rating || 0;

  return (
    <div className="star-rating" onMouseLeave={handleMouseLeave}>
      {[1, 2, 3, 4, 5].map((starValue) => {
        const isFilled = starValue <= activeValue;
        const isHovered = !readOnly && starValue <= hoverRating;

        return (
          <button
            key={starValue}
            type="button"
            className={`star-btn ${isFilled ? 'active' : ''} ${isHovered ? 'hovered' : ''}`}
            disabled={readOnly}
            onClick={() => handleClick(starValue)}
            onMouseEnter={() => handleMouseEnter(starValue)}
            title={!readOnly ? `Rate ${starValue} Star${starValue > 1 ? 's' : ''}` : `${rating} Stars`}
            style={{ cursor: readOnly ? 'default' : 'pointer' }}
          >
            <Star
              size={size}
              fill={isFilled ? 'var(--star-gold)' : 'none'}
              stroke={isFilled ? 'var(--star-gold)' : 'var(--text-muted)'}
              strokeWidth={1.8}
            />
          </button>
        );
      })}
    </div>
  );
};

export default StarRating;
