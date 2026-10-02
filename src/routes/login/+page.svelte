<script>
</script>

<div class="flex w-full bg-ivory h-full justify-around p-2">
    <div class="h-full w-full sm:w-2/3 lg:w-1/3 flex justify-center flex-col items-center align-middle">
        <h1 class="text-2xl md:text-3xl text-center font-display font-bold p-1">Login / Registreren</h1>
        <form class="md:h-2/5 w-full border bg-surface flex flex-col space-y-2 p-2" method="POST">
            <div class="w-full md:h-full flex flex-col md:flex-row md:items-center gap-1 md:gap-2">
                <label for="email" class="text-md font-bold p-1 md:whitespace-nowrap">E-mail Address</label>
                <input id="email" name="email" class="w-full" type="text" placeholder="Email Address" required />
            </div>
            <div class="w-full md:h-full flex flex-col md:flex-row md:items-center gap-1 md:gap-2">
                <label for="password" class="text-md font-bold p-1 md:whitespace-nowrap">Wachtwoord</label>
                <input id="password" name="password" class="w-full" type="password" placeholder="password" required />
            </div>
            <div class="w-full md:h-full flex items-center justify-end pt-2 md:pt-0">
                <button class="bg-accent-sage rounded-md w-full md:w-20 py-2 md:py-0 font-display font-bold text-white hover:bg-green-500" type="submit">Verder</button>
            </div>
        </form>
    </div>
</div>