import axios from "axios";

const getSessions = async function() {
    const res = await axios.get(`${process.env.NEXT_PUBLIC_BASE_URL}/sessions`);
    return res.data.session_list;
}

export {getSessions}