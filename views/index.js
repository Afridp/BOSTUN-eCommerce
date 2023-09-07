const qtyChanges = async (req, res) => {
    try {
        const { count } = req.body
        // const { cartId } = req.body
        const { productId } = req.body

        const cart = await cartModel.findOne({ userId: req.session.userid });
        const product = await productModel.findOne({ _id: productId });
        const items = cart.items

        const cartProduct = items.find(
            (product) => product.product_Id.toString() === productId
        );

        if (count == 1) {
            if (cartProduct.quantity < product.quantity) {
                await cartModel.updateOne(
                    { userId: req.session.userid, 'items.product_Id': productId }, {
                    $inc: {
                        'items.$.quantity': 1,
                        'items.$.totalPrice': product.price
                    }
                })
                res.json({ success: true });
            } else {
                res.json({ success: false, message: `The maximum quantity available for this product is ${product.quantity} . Please adjust your quantity.` })
            }
        } else if (count == -1) {
            if (cartProduct.quantity > 1) {
                await cartModel.updateOne(
                    { userId: req.session.userid, 'items.product_Id': productId }, {
                    $inc: {

                        'items.$.quantity': -1,
                        'items.$.totalPrice': -product.price
                    }
                })

                res.json({ success: true })

            } else {
                res.json({ success: false, message: 'Minimum one quantity is needed' })
            }
        } else {
            res.json({ success: false, message: 'Invalid count value' })
        }
    } catch (error) {
        console.log(error.message);
    }
}


.toLocaleDateString('en-US', { year: 'numeric' ,
                                                month: 'short' , day: '2-digit' }).replace(/\//g,'-')





                                                <div class="message-box" style="background-color: <%= message === 'saved' ? 'green' : 'red' %>;">
              <p><%= message %></p>
            </div>




<% if(typeof message !=='undefined' ) { %>
    <h6 class="text-danger">
        <%= message %>
    </h6>
    <% } %>