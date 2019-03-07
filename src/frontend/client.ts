// JWT eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MywiaWF0IjoxNTUxOTk1OTMyfQ.R7QYYFVk1hu9t6DQFNhZlUNTat6gIFn1AVl901C-mOQ

/****************************************************************
*  AUTH SERVICES
****************************************************************/

async function getToken(email: string, password: string) {
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
    return json;
}

/****************************************************************
*  USER SERVICES
****************************************************************/

async function createUser(email: string, password: string) {
    const data = {
        email: email,
        password: password
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
    return json;
}

async function getUserById(id: number, jwt: string) {
    const response = await fetch(
        `/api/v1/users/${id}`,
        {
            method: "GET",
            headers: {
                "x-auth-token": jwt
            }
        }
    );
    const json = await response.json();
    return json;
}

/****************************************************************
*  LINK SERVICES
****************************************************************/

async function createLink(title: string, url: string, jwt: string) {
    const data = {
        title: title,
        url: url
    };
    const response = await fetch(
        "/api/v1/links",
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "x-auth-token": jwt
            },
            body: JSON.stringify(data)
        }
    );
    const json = await response.json();
    return json;
}

async function getAllLinks() {
    const response = await fetch("/api/v1/links");
    const json = await response.json();
    return json;
}

async function getLinkById(id: number) {
    const response = await fetch(`/api/v1/links/${id}`);
    const json = await response.json();
    return json;
}

async function deleteLinkById(id: number, jwt: string) {
    const response = await fetch(
        `/api/v1/links/${id}`,
        {
            method: "DELETE",
            headers: {
                "Content-Type": "application/json",
                "x-auth-token": jwt
            }
        }
    );
    const json = await response.json();
    return json;
}

async function upvoteLink(id: string, jwt: string) {

}

async function downvoteLink(id: string, jwt: string) {
    
}

/****************************************************************
*  COMMENT SERVICES
****************************************************************/

async function deleteCommentById(id: string, jwt: string) {

}

async function updateComment(id: string, content: string, jwt: string) {

}

async function createComment(linkId: number, content: string, jwt: string) {

}
