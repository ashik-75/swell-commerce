"use client";

import { removeFromCart } from "@/lib/swell/cart";
import { applyCoupon } from "@/lib/swell/coupon";
import { formatCurrency } from "@/lib/utils";
import { Dialog, Transition } from "@headlessui/react";
import { XMarkIcon } from "@heroicons/react/24/outline";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import Image from "next/image";
import { Dispatch, FormEvent, Fragment, SetStateAction, useState } from "react";
import { toast } from "react-hot-toast";

interface Props {
  isCartOpen: Boolean;
  setIsCartOpen: Dispatch<SetStateAction<boolean>>;
  cart: any;
  cartIsLoading: boolean;
}

function CartSlider({ isCartOpen, setIsCartOpen, cart, cartIsLoading }: Props) {
  const [coupon, setCoupon] = useState("");
  const queryClient = useQueryClient();
  const { isLoading, mutateAsync } = useMutation({
    mutationFn: (productId: string) => removeFromCart(productId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["cart"],
      });
    },
    onError: (error: Error) => {
      toast.error(error?.message);
    },
  });

  const removeItem = (prodId: string) => {
    toast.promise(mutateAsync(prodId), {
      loading: <b>Deleting ...</b>,
      success: <b>Item Removed</b>,
      error: <b>Something went wrong</b>,
    });
  };

  const { mutateAsync: couponMutate } = useMutation({
    mutationFn: (code: string) => applyCoupon(code),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["cart"],
      });
    },
  });

  const handleCoupon = (e: FormEvent) => {
    e.preventDefault();
    toast.promise(couponMutate(coupon), {
      loading: "Check coupon...",
      success: "you get the discount!",
      error: "sorry, invalid coupon code",
    });
  };
  return (
    <Transition.Root show={Boolean(isCartOpen)} as={Fragment}>
      <Dialog as="div" className="relative z-10" onClose={setIsCartOpen}>
        <Transition.Child
          as={Fragment}
          enter="ease-in-out duration-500"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in-out duration-500"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-hidden">
          <div className="absolute inset-0 overflow-hidden">
            <div className="pointer-events-none fixed inset-y-0 right-0 flex max-w-full pl-10">
              <Transition.Child
                as={Fragment}
                enter="transform transition ease-in-out duration-500 sm:duration-700"
                enterFrom="translate-x-full"
                enterTo="translate-x-0"
                leave="transform transition ease-in-out duration-500 sm:duration-700"
                leaveFrom="translate-x-0"
                leaveTo="translate-x-full"
              >
                <Dialog.Panel className="pointer-events-auto w-screen max-w-md">
                  <div className="flex h-full flex-col overflow-y-scroll bg-white shadow-xl">
                    <div className="flex-1 overflow-y-auto px-4 py-6 sm:px-6">
                      <div className="flex items-start justify-between">
                        <Dialog.Title className="text-lg font-medium text-gray-900">
                          Shopping cart
                        </Dialog.Title>
                        <div className="ml-3 flex h-7 items-center">
                          <button
                            type="button"
                            className="-m-2 p-2 text-gray-400 hover:text-gray-500"
                            onClick={() => setIsCartOpen(false)}
                          >
                            <span className="sr-only">Close panel</span>
                            <XMarkIcon className="h-6 w-6" aria-hidden="true" />
                          </button>
                        </div>
                      </div>

                      <div className="mt-8">
                        <div className="flow-root">
                          <ul
                            role="list"
                            className="-my-6 divide-y divide-gray-200"
                          >
                            {cart?.items?.map((item: any) => (
                              <li key={item?.id} className="flex py-6">
                                <div className="relative h-24 w-24 flex-shrink-0 overflow-hidden rounded-md border border-gray-200">
                                  <Image
                                    fill
                                    src={item?.product.images?.[0]?.file?.url}
                                    alt={item?.product.images?.[0]?.file?.url}
                                    className="h-full absolute w-full object-cover object-center"
                                  />
                                </div>

                                <div className="ml-4 flex flex-1 flex-col">
                                  <div>
                                    <div className="flex justify-between text-base font-medium text-gray-900">
                                      <h3>
                                        <a href={`/${item?.product?.slug}`}>
                                          {item?.product.name}
                                        </a>
                                      </h3>
                                      <p className="ml-4">
                                        {formatCurrency({
                                          amount: item?.product?.price,
                                        })}
                                      </p>
                                    </div>
                                    <p className="mt-1 text-sm text-gray-500">
                                      {"Red"}
                                    </p>
                                  </div>
                                  <div className="flex flex-1 items-end justify-between text-sm">
                                    <p className="text-gray-500">
                                      Qty {item?.quantity}
                                    </p>

                                    <div className="flex">
                                      <button
                                        onClick={() => removeItem(item?.id)}
                                        type="button"
                                        disabled={isLoading}
                                        className="font-medium text-indigo-600 hover:text-indigo-500"
                                      >
                                        Remove
                                      </button>
                                    </div>
                                  </div>
                                </div>
                              </li>
                            ))}
                          </ul>
                        </div>

                        <form onSubmit={handleCoupon}>
                          <input
                            className="outline-none px-4 py-2 rounded border border-zinc-300"
                            value={coupon}
                            onChange={(e) => setCoupon(e.target.value)}
                            type="text"
                            placeholder="apply coupon"
                          />
                          <button
                            type="submit"
                            className="px-2 py-1 rounded border"
                          >
                            APPLY
                          </button>
                        </form>
                      </div>
                    </div>

                    <div className="border-t border-gray-200 px-4 py-6 sm:px-6">
                      <div className="flex justify-between text-base font-medium text-gray-900">
                        <p>Subtotal</p>
                        <p>
                          {formatCurrency({
                            amount: cart?.sub_total,
                          })}
                        </p>
                      </div>
                      <p className="mt-0.5 text-sm text-gray-500">
                        Shipping and taxes calculated at checkout.
                      </p>
                      <div className="mt-6">
                        <a
                          href={cart?.checkout_url}
                          className="flex items-center justify-center rounded-md border border-transparent bg-indigo-600 px-6 py-3 text-base font-medium text-white shadow-sm hover:bg-indigo-700"
                        >
                          Checkout
                        </a>
                      </div>
                      <div className="mt-6 flex justify-center text-center text-sm text-gray-500">
                        <p>
                          or
                          <button
                            type="button"
                            className="font-medium text-indigo-600 hover:text-indigo-500"
                            onClick={() => setIsCartOpen(false)}
                          >
                            Continue Shopping
                            <span aria-hidden="true"> &rarr;</span>
                          </button>
                        </p>
                      </div>
                    </div>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  );
}

export default CartSlider;