import ProductCards from './ProductCards';
import useFetch from './../utils/useFetch.js';


const Home = () => {
    const { data: products, loading, error } = useFetch("/products/get-products");

    // const products = [
    //     {
    //         id: 1,
    //         name: "Product 1",
    //         price: 100,
    //         description: "Product description 1"
    //     },
    //     {
    //         id: 2,
    //         name: "Product 2",
    //         price: 200,
    //         description: "Product description 2"
    //     }
    // ];
    // const loading = false;
    // const error = null;

    return (
        <div>
            {
                loading && <h3>Loading...</h3>
            }
            {
                error && <h3>Error: {error}</h3>
            }
            {
                (loading === false && error == null) && <ProductCards products={products} />
            }
        </div>
    );
}

export default Home;