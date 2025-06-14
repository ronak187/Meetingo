import { useState, useEffect } from 'react';

const useFetch = (request) => {

    console.log("useFetch called");
    
    const baseUrl = "http://localhost:9090";
    const url = baseUrl + request;
    
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const callAbort = new AbortController();
        fetch(url, { signal: callAbort.signal })
            .then(res => {
                if (res.ok) {
                    return res.json();
                }
                throw new Error("Could not fetch data at the moment");
            }).then(data => {
                setData(data);
                console.log(data);
                setLoading(false);
            }).catch(error => {
                if (error.name === "AbortError") {
                } else {
                    setError(error);
                    setLoading(false);
                }
            });

        return () => callAbort.abort();
    }, [url]);

    console.log("Last", data);

    return { data, loading, error };
}

export default useFetch;