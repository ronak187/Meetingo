import { useState, useEffect } from 'react';

const useFetchToGetData = (request, requestBody) => {

    console.log("useFetchToGetData called");

    const baseUrl = "http://localhost:9090";
    const url = baseUrl + request;

    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    console.log("request body: ", requestBody);

    useEffect(() => {
        if (requestBody !== null) {
            const callAbort = new AbortController();

            fetch(url, {
                signal: callAbort.signal, method: "POST", headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(requestBody),
            })
                .then(res => {
                    console.log("res: ", res);
                    if (res.ok) {
                        return res.json();
                    }
                    throw new Error(res.status);
                }).then(data => {
                    setData(data);
                    console.log("response from api: ", data);
                    setLoading(false);

                }).catch(error => {
                    console.log("Error: ", error);
                    if (error.name === "AbortError") {
                    } else {
                        setError(error);
                        setLoading(false);
                    }
                });
            return () => callAbort.abort();
        } else {
            console.log("Body Null");
            setLoading(false);
        }
    }, [url, requestBody]);

    return { data, loading, error };
}

export default useFetchToGetData;