$vehicles = @(
    # Scooters
    @{ name = "tvs-ntorq-125"; url = "https://www.bikewale.com/tvs-bikes/ntorq-125/" },
    @{ name = "honda-activa-125"; url = "https://www.bikewale.com/honda-bikes/activa-125/" },
    @{ name = "yamaha-fascino-125"; url = "https://www.bikewale.com/yamaha-bikes/fascino-125/" },

    # Mopeds
    @{ name = "tvs-xl100-heavy-duty"; url = "https://www.bikewale.com/tvs-bikes/xl-100/" },
    @{ name = "tvs-xl100-comfort"; url = "https://www.bikewale.com/tvs-bikes/xl-100-comfort/" },

    # Motorcycles / Bikes
    @{ name = "royal-enfield-classic-350"; url = "https://www.bikewale.com/royal-enfield-bikes/classic-350/" },
    @{ name = "royal-enfield-hunter-350"; url = "https://www.bikewale.com/royal-enfield-bikes/hunter-350/" },
    @{ name = "honda-shine-125"; url = "https://www.bikewale.com/honda-bikes/shine/" },
    @{ name = "honda-sp-125"; url = "https://www.bikewale.com/honda-bikes/sp-125/" },
    @{ name = "bajaj-pulsar-150"; url = "https://www.bikewale.com/bajaj-bikes/pulsar-150/" },
    @{ name = "bajaj-pulsar-ns200"; url = "https://www.bikewale.com/bajaj-bikes/pulsar-ns200/" },
    @{ name = "tvs-apache-rtr-160"; url = "https://www.bikewale.com/tvs-bikes/apache-160/" },
    @{ name = "yamaha-fzs-fi"; url = "https://www.bikewale.com/yamaha-bikes/fz-s/" },
    @{ name = "hero-splendor-plus"; url = "https://www.bikewale.com/hero-bikes/splendor-plus/" },
    @{ name = "hero-xtreme-125r"; url = "https://www.bikewale.com/hero-bikes/xtreme-125r/" },

    # Cars
    @{ name = "maruti-swift"; url = "https://www.carwale.com/maruti-suzuki-cars/swift/" },
    @{ name = "maruti-alto-k10"; url = "https://www.carwale.com/maruti-suzuki-cars/alto-k10/" },
    @{ name = "maruti-baleno"; url = "https://www.carwale.com/maruti-suzuki-cars/baleno/" },
    @{ name = "maruti-dzire"; url = "https://www.carwale.com/maruti-suzuki-cars/dzire/" },
    @{ name = "hyundai-grand-i10-nios"; url = "https://www.carwale.com/hyundai-cars/grand-i10-nios/" },
    @{ name = "hyundai-i20"; url = "https://www.carwale.com/hyundai-cars/i20/" },
    @{ name = "tata-punch"; url = "https://www.carwale.com/tata-cars/punch/" },
    @{ name = "tata-nexon"; url = "https://www.carwale.com/tata-cars/nexon/" },
    @{ name = "hyundai-creta"; url = "https://www.carwale.com/hyundai-cars/creta/" },
    @{ name = "kia-sonet"; url = "https://www.carwale.com/kia-cars/sonet/" },
    @{ name = "toyota-innova-crysta"; url = "https://www.carwale.com/toyota-cars/innova-crysta/" },
    @{ name = "maruti-ertiga"; url = "https://www.carwale.com/maruti-suzuki-cars/ertiga/" },
    @{ name = "mahindra-thar"; url = "https://www.carwale.com/mahindra-cars/thar/" }
)

foreach ($v in $vehicles) {
    try {
        $raw = (curl.exe -s -L $v.url | Out-String)
        $img = $null
        if ($raw -match 'https://imgd.aeplcdn.com/[^"''\s\?]+/(?:[a-z0-9\-]+)-(?:right-side-view|right-front-three-quarter|front-view)[^"''\s\?]*\.(?:png|jpeg|jpg)') {
            $img = $Matches[0]
        } elseif ($raw -match 'https://imgd.aeplcdn.com/[^"''\s\?]+\.(?:png|jpeg|jpg)') {
            $img = $Matches[0]
        }

        if ($img) {
            $highRes = $img -replace 'https://imgd.aeplcdn.com/\d+x\d+/', 'https://imgd.aeplcdn.com/1056x594/'
            $ext = if ($highRes -match '\.png') { "png" } else { "jpg" }
            $dest = "frontend/public/images/vehicles/$($v.name).$ext"
            curl.exe -s -L -o $dest $highRes
            $len = (Get-Item $dest).Length
            Write-Host "$($v.name) -> Downloaded ($len bytes)"
        } else {
            Write-Host "$($v.name) -> Image not found on page"
        }
    } catch {
        Write-Host "$($v.name) -> Error: $_"
    }
}
