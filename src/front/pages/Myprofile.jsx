import { useState } from "react"

export const Myprofile = () => {

    const urlBase = import.meta.env.VITE_BACKEND_URL

    const [user, setUser] = useState({
        image: "",
        username: "",
        fullname: "",
        email: ""
    });

    const [editing, setEditing] = useState({
        image: false,
        username: false,
        fullname: false,
        email: false,
    });


    return <div className="container">
        <div className="row">
            <div className="col-12">
                <div className="row align-columns mt-5">
                    <div className="div col-4 border">
                        <div>
                            <h2>My Profile</h2>
                        </div>
                        <button className="btn btn-sm btn-warning w-100 my-2">Profile Details</button>
                    </div>
                    <div className="div col-8 border">
                        <div>
                            <h2>Profile Details</h2>
                        </div>
                        <div>
                            <img src="https://via.placeholder.com/150" alt="Profile" />
                            <button className="btn btn-sm btn-info mx-2">Edit</button>
                        </div>
                        <div className="form-control">
                            <label>{user.username ? "User Name" : " "}</label>
                            {editing.username ? (
                                <input className="mx-2" type="text" placeholder="User Name" />
                            ) : (
                                <div>
                                    <label>Username</label>
                                    <p className="mx-2 mt-2">{user.username || <div className="form-control">
                                        User Name
                                    </div>}</p>
                                    </div>
                            )}

                            <button className="btn btn-sm btn-info">Edit</button>
                        </div>
                        <div className="form-control">
                            <label>Email</label>
                            <input className="mx-2" type="email" placeholder="Email" />
                            <button className="btn btn-sm btn-info">Edit</button>
                        </div>
                        <div className="form-control">
                            <label>Password</label>
                            <input className="mx-2" type="password" placeholder="Password" />
                            <button className="btn btn-sm btn-info">Edit</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>

}