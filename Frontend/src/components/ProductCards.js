import { Link } from "react-router-dom";
import "../css/productCard.css";

function ProductCards(props) {
    let products = props.products;

    return (
        <div className="products">
            {
                products.map((product) =>
                (
                    <div className="card" key={product.id}>
                        <Link to={"/product-details/" + product.id}>
                            <div className="card-body">
                                <h3>{product.title}</h3>
                                <h4>{product.price}</h4>
                                <div className="text-muted">
                                    {product.description}
                                </div>
                            </div>
                        </Link>
                    </div>
                ))
            }
        </div>
    );
}

export default ProductCards;