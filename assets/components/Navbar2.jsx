"use client"

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Dialog, DialogPanel } from '@headlessui/react'
import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline'
import logo from "@/public/logo.png";
import profile from "@/public/profile.png";
import { ThemeToggle } from "./ThemeProvider";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { signIn, signOut, useSession, getProviders } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { FcGoogle } from "react-icons/fc";
import { FaArrowRightFromBracket } from "react-icons/fa6";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const navigation = [
  { id: 1, text: "Home", link: "/" },
  { id: 2, text: "Stores", link: "/stores" },
  { id: 3, text: "Products", link: "/products" },
  { id: 4, text: "About", link: "/about" },
];

export default function Navbar2() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [providers, setProviders] = useState(null);
  const { data: session } = useSession();

  const profileImage = session?.user?.image;

  useEffect(() => {
    const setAuthProviders = async () => {
      const res = await getProviders();
      setProviders(res);
    };

    setAuthProviders();
  }, []);

  return (
    <header className="absolute inset-x-0 top-0 z-50">
      <nav aria-label="Global" className="flex items-center justify-between p-6 lg:px-8">
        <div className="flex lg:flex-1">
          <Link href="/" className="-m-1.5 p-1.5">
            <span className="sr-only">Your Company</span>
            <Image src={logo} alt="logo" className="h-8 w-auto" />
          </Link>
        </div>

        <div className="flex lg:hidden">
          <button
            type="button"
            onClick={() => setMobileMenuOpen(true)}
            className="-m-2.5 inline-flex items-center justify-center rounded-md p-2.5 text-gray-700"
          >
            <span className="sr-only">Open main menu</span>
            <Bars3Icon aria-hidden="true" className="h-6 w-6" />
          </button>
        </div>

        <div className="hidden lg:flex lg:gap-x-12">
          {navigation.map((item) => (
            <Link key={item.id} href={item.link} className="text-sm/6 font-semibold dark:text-gray-50 text-gray-900">
              {item.text}
            </Link>
          ))}
        </div>

        <div className="hidden lg:flex lg:flex-1 lg:justify-end items-center gap-4">
          <ThemeToggle />
          {!session ? (
            <>
              <Button variant="outline" onClick={() => signIn()}>
                <FcGoogle className="h-5 w-5 mr-3" />
                Login | Register
              </Button>
            </>
          ) : (
            <div className="flex items-center gap-4">
              <Button onClick={() => signOut()}>
                Logout
                <FaArrowRightFromBracket className="h-5 w-5 ml-3" />
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Avatar>
                    <AvatarImage src={profileImage} alt={profile} />
                  </Avatar>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuLabel>My Account</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>Profile</DropdownMenuItem>
                  <DropdownMenuItem>Products</DropdownMenuItem>
                  <DropdownMenuItem>Purchases</DropdownMenuItem>
                  <DropdownMenuItem>Messages</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          )}
        </div>
      </nav>

      <Dialog open={mobileMenuOpen} onClose={setMobileMenuOpen} className="lg:hidden">
        <div className="fixed inset-0 z-50" />
        <DialogPanel className="fixed inset-y-0 right-0 z-50 w-full overflow-y-auto dark:bg-gray-800 bg-white p-6 sm:max-w-sm sm:ring-1 sm:ring-gray-900/10">
          <div className="flex items-center justify-between">
            <Link href="/" className="-m-1.5 p-1.5">
              <span className="sr-only">Your Company</span>
              <Image src={logo} alt="logo" className="h-8 w-auto" />
            </Link>
            <button type="button" onClick={() => setMobileMenuOpen(false)} className="-m-2.5 rounded-md p-2.5 text-gray-700">
              <span className="sr-only">Close menu</span>
              <XMarkIcon aria-hidden="true" className="h-6 w-6" />
            </button>
          </div>
          <div className="mt-6 flow-root">
            <div className="-my-6 divide-y divide-gray-500/10">
              <div className="space-y-2 py-6">
                {navigation.map((item) => (
                  <Link key={item.id} href={item.link} className="-mx-3 block rounded-lg px-3 py-2 text-base/7 font-semibold dark:text-gray-50 text-gray-900 dark:hover:bg-gray-700 hover:bg-gray-50">
                    {item.text}
                  </Link>
                ))}
              </div>
              <div className="py-6">
                {!session ? (
                  <Button variant="outline" onClick={() => signIn()} className="w-full">
                    <FcGoogle className="h-5 w-5 mr-3" />
                    Login | Register
                  </Button>
                ) : (
                  <div className="space-y-2">
                    <Button onClick={() => signOut()} className="w-full">Logout</Button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </DialogPanel>
      </Dialog>
    </header>
  );
}