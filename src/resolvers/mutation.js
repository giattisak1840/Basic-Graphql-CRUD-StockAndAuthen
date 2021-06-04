import bcrypt from "bcryptjs";

import User from "../models/user";
import Product from "../models/product";
import CartItem from "../models/cartItem";

const Mutation = {
  signup: async (parent, args, context, info) => {
    const email = args.email.trim().toLowerCase();

    const currentUsers = await User.find({});
    const isEmailExit =
      currentUsers.findIndex((user) => user.email === email) > -1;

    if (isEmailExit) {
      throw new Error("Email already exist");
    }

    if (args.password.trim().length < 6) {
      throw new Error("Password must be at least 6 characters");
    }

    const password = await bcrypt.hash(args.password, 10);

    return User.create({ ...args, email, password });
  },
  createProduct: async (parent, args, {userId}, info) => {
    if (!userId) throw new Error("Please login");

    if (!args.description || !args.price || !args.imageUrl) {
      throw new Error("Please provide all required fields");
    }

    const product = await Product.create({ ...args, user: userId });
    const user = await User.findById(userId);

    if (!user.products) {
      user.products = [product];
    } else {
      user.products.push(product);
    }

    await user.save();

    return Product.findById(product.id).populate({
      path: "user",
      populate: { path: "products" },
    });
  },
  updateProduct: async (parent, args, {userId}, info) => {
    const { id, description, price, imageUrl } = args;

    if (!userId) throw new Error("Please login");

    const product = await Product.findById(id);

    if (userId !== product.user.toString()) {
      throw new Error("You are not authorized");
    }

    const updateInfo = {
      description: !!description ? description : product.description,
      price: !!price ? price : product.price,
      imageUrl: !!imageUrl ? imageUrl : product.imageUrl,
    };

    await Product.findByIdAndUpdate(id, updateInfo);

    const updatedProduct = await Product.findById(id).populate({
      path: "user",
    });

    return updatedProduct;
  },
  addToCart: async (parent, args, {userId}, info) => {
    if (!userId) throw new Error("Please login");

    const productId = args.id;

    try {
      const user = await User.findById(userId).populate({
        path: "carts",
        populate: { path: "product" },
      });

      const findCartItemIndex = user.carts.findIndex(
        (cartItem) => cartItem.product.id === productId
      );

      if (findCartItemIndex > -1) {
        user.carts[findCartItemIndex].quantity += 1;

        await CartItem.findByIdAndUpdate(user.carts[findCartItemIndex].id, {
          quantity: user.carts[findCartItemIndex].quantity,
        });

        const updateCartItem = await CartItem.findById(
          user.carts[findCartItemIndex].id
        )
          .populate({ path: "product" })
          .populate({ path: "user" });
        return updateCartItem;
      } else {
        const cartItem = await CartItem.create({
          product: productId,
          quantity: 1,
          user: userId,
        });

        const newCartItem = await CartItem.findById(cartItem.id)
          .populate({ path: "product" })
          .populate({ path: "user" });

        await User.findByIdAndUpdate(userId, {
          carts: [...user.carts, newCartItem],
        });

        return newCartItem;
      }
    } catch (err) {
      console.log(err);
    }
  },
  deleteCart: async (parent, args, {userId}, info) => {
    if (!userId) throw new Error("Please login");

    const { id } = args;
    const cart = await CartItem.findById(id);

    const user = await User.findById(userId);

    if (cart.user.toString() !== userId) {
        throw new Error("You are not authorized");
    }

    const deletedCart = await CartItem.findOneAndDelete(id);

    const updatedUserCarts = user.carts.filter(cartId => cartId.toString() !== deletedCart.id.toString());

    await User.findByIdAndUpdate(userId, { carts: updatedUserCarts});

    return deletedCart;
  },
};

export default Mutation;
