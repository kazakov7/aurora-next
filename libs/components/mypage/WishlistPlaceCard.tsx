import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, Star, ArrowRight } from "lucide-react";
import LikeButton from "../common/LikeButton";
import { useI18n } from "../../i18n";

interface WishlistPlaceCardProps {
  images: string[];
  tags: string[];
  rating: number;
  title: string;
  dateRange: string;
  hostType: string;
  description: string;
  pricePerNight: number;
  currency: string;
  priceUnit: string;
  isLiked: boolean;
  onLikeToggle: (e: React.MouseEvent) => void;
  onClick: () => void;
}

const WishlistPlaceCard = ({
  images,
  tags,
  rating,
  title,
  dateRange,
  hostType,
  description,
  pricePerNight,
  currency,
  priceUnit,
  isLiked,
  onLikeToggle,
  onClick,
}: WishlistPlaceCardProps) => {
  const { t } = useI18n();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(0);

  const changeImage = (e: React.MouseEvent, newDirection: number) => {
    e.stopPropagation();
    setDirection(newDirection);
    setCurrentIndex((prevIndex) => {
      const nextIndex = prevIndex + newDirection;
      if (nextIndex < 0) return images.length - 1;
      if (nextIndex >= images.length) return 0;
      return nextIndex;
    });
  };

  const carouselVariants = {
    enter: (direction: number) => ({
      x: direction > 0 ? "100%" : "-100%",
      opacity: 0,
    }),
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1,
    },
    exit: (direction: number) => ({
      zIndex: 0,
      x: direction < 0 ? "100%" : "-100%",
      opacity: 0,
    }),
  };

  const contentVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.5 }}
      variants={contentVariants}
      whileHover={{
        scale: 1.03,
        boxShadow: "0px 10px 30px -5px rgba(20, 27, 43, 0.1)",
        transition: { type: "spring", stiffness: 300, damping: 20 },
      }}
      className="wishlist-place-card"
      onClick={onClick}
    >
      {/* Image Carousel Section */}
      <div className="card-image-carousel group">
        <AnimatePresence initial={false} custom={direction}>
          <motion.img
            key={currentIndex}
            src={images[currentIndex]}
            alt={title}
            custom={direction}
            variants={carouselVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{
              x: { type: "spring", stiffness: 300, damping: 30 },
              opacity: { duration: 0.2 },
            }}
            className="carousel-img"
          />
        </AnimatePresence>

        {/* Carousel Navigation */}
        <div className="carousel-nav">
          <button className="nav-btn" onClick={(e) => changeImage(e, -1)}>
            <ChevronLeft className="icon" />
          </button>
          <button className="nav-btn" onClick={(e) => changeImage(e, 1)}>
            <ChevronRight className="icon" />
          </button>
        </div>

        {/* Top Badges */}
        <div className="top-left-badges">
          {tags.map((tag) => (
            <span key={tag} className="blur-badge">
              {tag}
            </span>
          ))}
        </div>

        {/* Like Button */}
        <div className="top-right-actions" onClick={(e) => e.stopPropagation()}>
          <LikeButton isLiked={isLiked} onClick={onLikeToggle} />
        </div>

        {/* Pagination Dots */}
        <div className="pagination-dots">
          {images.map((_, index) => (
            <button
              key={index}
              onClick={(e) => {
                e.stopPropagation();
                setCurrentIndex(index);
              }}
              className={`dot ${currentIndex === index ? "active" : ""}`}
              aria-label={t("profile.wishlistCard.goToImage", { index: index + 1 })}
            />
          ))}
        </div>
      </div>

      {/* Content Section */}
      <motion.div variants={contentVariants} className="card-content-wrap">
        <motion.div variants={itemVariants} className="header-row">
          <h3 className="place-title">{title}</h3>
          <span className="rating-badge">
            <Star className="star-icon" /> {rating}
          </span>
        </motion.div>

        <motion.div variants={itemVariants} className="meta-info">
          <span>{dateRange}</span> &bull; <span>{hostType}</span>
        </motion.div>

        <motion.p variants={itemVariants} className="description-text">
          {description}
        </motion.p>

        <motion.div variants={itemVariants} className="bottom-row">
          <p className="price-text">
            {new Intl.NumberFormat("en-US", {
              style: "currency",
              currency,
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            }).format(pricePerNight)}{" "}
            <span className="unit">{priceUnit}</span>
          </p>
          <button className="book-btn group-btn">
            {t("profile.wishlistCard.reserve")}
            <ArrowRight className="arrow-icon" />
          </button>
        </motion.div>
      </motion.div>
    </motion.div>
  );
};

export default WishlistPlaceCard;
