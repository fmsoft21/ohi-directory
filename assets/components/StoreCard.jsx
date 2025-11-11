import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Heart, MapPin, Store } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

const StoreCard = ({ shop, onLike, isHighlighted }) => {
  const [animate, setAnimate] = useState(false);
  const [hovered, setHovered] = useState(false);

  useEffect(() => {
    if (isHighlighted) {
      setAnimate(true);
      const timer = setTimeout(() => setAnimate(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [isHighlighted]);

  return (
    // <Card
    //   id={`store-${shop.id}`}
    //   onMouseEnter={() => setHovered(true)}
    //   onMouseLeave={() => setHovered(false)}
    //   className={
    //     `  overflow-hidden block rounded-2xl shadow-lg transition-all duration-400 ease-in-out
    //     ${(animate || hovered) ? 'ring-2 ring-emerald-500 shadow-emerald-200 dark:shadow-emerald-900' : 'border-none'} bg-zinc-100 dark:bg-zinc-800 flex flex-col h-full`
    //   }
    // >
    <Card
      id={`store-${shop.id}`}
      
      className="flex flex-col h-full overflow-hidden rounded-2xl border-none shadow-lg hover:cursor-pointer hover:ring-emerald-600 hover:ring-2 hover:transition-all hover:duration-300">
      <CardContent className="px-8 py-10 flex-1">
        <div className="flex flex-col items-center text-center">
          {/* Large circular avatar like the Tailwind example */}
          <div className="relative w-32 h-32 md:w-40 md:h-40 rounded-full overflow-hidden mb-6">
            <Image
              src={shop.avatar}
              alt={shop.name}
              fill
              className="object-cover"
            />
          </div>

          <h3 className="text-xl md:text-2xl font-semibold dark:text-white">{shop.name}</h3>
          {shop.about && <p className="mt-2 text-sm dark:text-gray-300 max-w-[20rem] line-clamp-3">{shop.about}</p>}

          {(shop.city || shop.province) && (
            <div className="mt-3 text-sm dark:text-gray-200 flex items-center gap-2">
              <MapPin className="h-4 w-4 dark:text-gray-200" />
              <span>{shop.city && shop.province ? `${shop.city}, ${shop.province}` : shop.city || shop.province}</span>
            </div>
          )}

          <div className="mt-6 flex items-center gap-3">
            <Link href={`/stores/${shop.id}`}>
              <Button className="bg-emerald-600 hover:bg-emerald-700 text-white">
                <Store className="h-4 w-4 mr-2" />
                View Store
              </Button>
            </Link>

            <Button
              variant="outline"
              onClick={() => onLike(shop.id)}
              className={`${shop.isLiked ? 'bg-red-500 text-white border-red-500 hover:bg-zinc-800' : 'text-red-500 border-red-500 dark:bg-zinc-800 hover:bg-red-500 hover:text-white'}`}
            >
              <Heart className={`h-4 w-4 ${shop.isLiked ? 'fill-current' : ''}`} />
            </Button>
          </div>
        </div>
      </CardContent>

  <CardFooter className="flex p-0 border-t dark:border-gray-700 dark:bg-zinc-900 mt-auto">
        <div className="flex-1 px-4 py-3 text-center border-r dark:border-gray-700">
          <div className="text-lg font-semibold dark:text-white">{shop.likes}</div>
          <div className="text-sm dark:text-gray-400">Likes</div>
        </div>
        <div className="flex-1 px-4 py-3 text-center">
          <div className="text-lg font-semibold dark:text-white">{shop.totalProducts}</div>
          <div className="text-sm dark:text-gray-400">Products</div>
        </div>
      </CardFooter>
    </Card>
  );
};

export default StoreCard;