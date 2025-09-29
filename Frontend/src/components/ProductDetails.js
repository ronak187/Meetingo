import { useParams } from "react-router-dom";
import useFetch from "./../utils/useFetch";

const ProductDetailsUi = (details) => {
    return (
        <div className="container">
            <h3>
                {
                    details['title'] + " @ ₹" + details['price']
                }
            </h3>
            <p className="text-muted">
                {
                    details["description"]
                }
            </p>
        </div>
    );
}

const ProductDetails = () => {
    const { id } = useParams();

    const { data: details, loading, error } = useFetch("/products/get-product/" + id);

    return (
        <div>
            {
                (loading) ? <div>Loading...</div> : <div></div>
            }
            {
                (error) ? <div>{error.name}</div> : <div></div>
            }
            {
                (loading === false  &&  (error === null  ||  error === false)) ? ProductDetailsUi(details) : <div></div>
            }
        </div>
    );
}

export default ProductDetails;