export let GeneralState: {user: {
        id: string,
        email: string,
        userName: string,
    } | null, readinglist: string[] | null} = $state({
    user: null,
    readinglist: null,
})