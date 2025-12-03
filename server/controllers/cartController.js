import User from '../models/userModel.js';

export const getCart = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate('cart.item');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.status(200).json(user.cart);
  } catch (error) {
    console.error("Error fetching cart:", error);
    res.status(500).json({ message: 'Server Error' });
  }
};

export const updateCart = async (req, res) => {
  try {
    const { cartItems } = req.body;
    const user = await User.findById(req.user.id);

    const sanitizedCart = cartItems.map(item => {
      if (item.type === 'package') {
        return {
          itemType: 'MealPackage',
          item: item._id,
          packageSelections: item.userChoices.map(choice => ({
            category: choice.category,
            selectedOptions: choice.selectedOptions.map(opt => ({ _id: opt._id, name: opt.name }))
          }))
        };
      }
      return {
        itemType: 'Product',
        item: item._id,
        quantity: item.quantity,
      };
    });

    user.cart = sanitizedCart;
    await user.save();
    
    const populatedUser = await user.populate('cart.item');
    res.status(200).json(populatedUser.cart);
  } catch (error) {
    console.error("Cart update error:", error);
    res.status(500).json({ message: 'Server Error' });
  }
};