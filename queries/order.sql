/* @name UpdateProductStock */
UPDATE productsMs
SET stock = stock - :quantity!
WHERE id = :productId!;