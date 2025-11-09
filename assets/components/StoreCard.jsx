import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Heart, MapPin, Store } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

const StoreCard = ({ shop, onLike }) => {
  return (
    <Card className="overflow-hidden pt-6 block rounded-lg border border-slate-200 dark:border-slate-700 shadow-sm shadow-indigo-100 dark:shadow-gray-700 hover:shadow-lg transition-shadow">
      <CardContent className="p-6">
        <div className="flex flex-col items-center">
          {/* Store Avatar */}
          <div className="relative w-20 h-20 mb-3">
            <Image
              src={shop.avatar}
              alt={shop.name}
              fill
              className="rounded-full object-cover"
            />
          </div>

          {/* Store Name */}
          <h3 className="text-xl font-semibold mb-2 text-foreground text-center">
            {shop.name}
          </h3>

          {/* Location */}
          {(shop.city || shop.province) && (
            <div className="flex items-center gap-1 text-sm text-muted-foreground mb-3">
              <MapPin className="h-4 w-4" />
              <span>
                {shop.city && shop.province 
                  ? `${shop.city}, ${shop.province}`
                  : shop.city || shop.province
                }
              </span>
            </div>
          )}

          {/* About */}
          {shop.about && (
            <p className="text-sm text-muted-foreground text-center mb-4 line-clamp-2">
              {shop.about}
            </p>
          )}

          {/* Action Buttons */}
          <div className="flex space-x-3">
            <Link href={`/stores/${shop.id}`}>
              <Button
                variant="outline"
                className="text-emerald-500 border-emerald-500 hover:bg-emerald-500 hover:text-white dark:hover:text-white"
              >
                <Store className="h-4 w-4 mr-2" />
                View Store
              </Button>
            </Link>
            <Button
              variant="outline"
              onClick={() => onLike(shop.id)}
              className={`${
                shop.isLiked
                  ? "bg-red-500 text-white border-red-500"
                  : "text-red-500 border-red-500 hover:bg-red-500 hover:text-white"
              }`}
            >
              <Heart
                className={`h-4 w-4 ${shop.isLiked ? "fill-current" : ""}`}
              />
            </Button>
          </div>
        </div>
      </CardContent>

      <CardFooter className="flex p-0 border-t">
        <div className="flex-1 px-4 py-3 text-center border-r">
          <div className="text-lg font-semibold text-foreground">
            {shop.likes}
          </div>
          <div className="text-sm text-muted-foreground">Likes</div>
        </div>
        <div className="flex-1 px-4 py-3 text-center">
          <div className="text-lg font-semibold text-foreground">
            {shop.totalProducts}
          </div>
          <div className="text-sm text-muted-foreground">Products</div>
        </div>
      </CardFooter>
    </Card>
  );
};

export default StoreCard;