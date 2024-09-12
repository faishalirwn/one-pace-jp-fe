import axios from "axios";

const getSessions = async function() {
    const res = await axios.get(`http://127.0.0.1:8000/sessions`);
    return res.data.session_list;
}

export {getSessions}