// One error message for the whole app, shown by the layout. Only set from the browser
// (after a client-side request), so the module-level state is never shared between server requests
export const notice = $state<{ message: string | null }>({ message: null });

export function showNotice(message: string) {
    notice.message = message;
}

export function clearNotice() {
    notice.message = null;
}
