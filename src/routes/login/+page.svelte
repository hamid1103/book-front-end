<script>
</script>

<div class="flex w-full bg-ivory h-full justify-around p-2">
    <div class="h-full w-1/3 flex justify-center flex-col items-center align-middle">
        <h1 class="text-3xl font-display font-bold p-1">Login / Registreren</h1>
        <form class="h-2/5 w-full border bg-surface flex flex-col space-y-2 p-2" method="POST">
            <div class="w-full h-full flex items-center space-x-2">
                <label for="email" class="text-md font-bold p-1">E-mail Address</label>
                <input name="email" class="w-full" type="text" placeholder="Email Address" required />
            </div>
            <div class="w-full h-full flex items-center space-x-2">
                <label for="password" class="text-md font-bold p-1">Wachtwoord</label>
                <input name="password" class="w-full" type="password" placeholder="password" required />
            </div>
            <div class="w-full h-full flex items-center justify-end space-x-2">
                <button class="bg-accent-sage rounded-md w-20 font-display font-bold text-white hover:bg-green-500" type="submit">Verder</button>
            </div>
        </form>
    </div>
</div>