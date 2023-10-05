<div class="input-upload">
<div id="image-container">
    <% product.image.forEach((image, index)=> { %>
        <div class="image-container">
            <button type="button" class="close-button"
                onclick="removeImage('<%= index %>')">&times;</button>
            <img id="product_img_<%= index %>"
                src="/images/<%= image %>" alt="" />
        </div>
        <% }); %>
</div>
<input name="product_img" id="product_img_input"
    class="form-control" type="file" accept="image/*"
    onchange="addImage(event)" multiple />
</div>
</div>




<div class="card-body">
                                                    <div class="row">
                                                        <% product.image.forEach((image, index)=> { %>
                                                            <div class="col-3" id="pdtImage">
                                                                <div class="image-container">
                                                                    <img class="img-fluid img-thumbnail"
                                                                        id="prdtimage_<%= index %>"
                                                                        src="/images/<%= image %>"
                                                                        alt="" />
                                                                    <a href="#"
                                                                        onclick="deleteImg(event, '<%= image %>', '<%= image._id %>')"
                                                                        class="btn btn-danger btn-sm delete-button mb-3">Delete</a>
                                                                </div>
                                                            </div>
                                                            <% }) %>
                                                    </div>
                                                    <div class="input-upload">
                                                        <input class="form-control" type="file" name="image"
                                                            id="imageInput" multiple onchange="viewImage(event)"
                                                            accept="image/*" />
                                                    </div>
                                                </div>