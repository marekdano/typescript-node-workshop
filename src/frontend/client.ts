// Create user
(async () => {
    const data = {
        email: "test@test.com",
        password: "mysecret"
    };
    const response = await fetch(
        "/api/v1/auth/login",
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(data)
        }
    );
    const json = await response.json();
    console.log(json);
})();

// Login
(async () => {
    const data = {
        email: "test@test.com",
        password: "mysecret"
    };
    const response = await fetch(
        "/api/v1/users",
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(data)
        }
    );
    const json = await response.json();
    console.log(json);
})();

// Get user by ID
(async () => {
    const response = await fetch("/api/v1/users/1");
    const json = await response.json();
    console.log(json);
})();

// Create link
(async () => {
    const data = {
        email: "test@test.com",
        password: "mysecret"
    };
    const response = await fetch(
        "/api/v1/links",
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "x-auth-token": "INSERT_JSON_WEB_TOKEN_HERE"
            },
            body: JSON.stringify(data)
        }
    );
    const json = await response.json();
    console.log(json);
})();

// Get all links
(async () => {
    const response = await fetch("/api/v1/links");
    const json = await response.json();
    console.log(json);
})();

// Get link by ID
(async () => {
    const response = await fetch("/api/v1/links/1");
    const json = await response.json();
    console.log(json);
})();

// Delete link by ID
(async () => {
    const response = await fetch(
        "/api/v1/links/1",
        {
            method: "DELETE",
            headers: {
                "Content-Type": "application/json",
                "x-auth-token": "INSERT_JSON_WEB_TOKEN_HERE"
            }
        }
    );
    const json = await response.json();
    console.log(json);
})();

