<?php

namespace App\Services\Report;

use App\Services\Report\Bab1Report;
use App\Services\Report\Bab2Report;
use App\Services\Report\Bab3Report;
use App\Services\Report\Bab4Report;
use App\Services\Report\Bab5Report;
use App\Services\Report\Bab6Report;
use App\Services\Report\Bab7Report;
use App\Services\Report\Bab8Report;

class ReportEngine
{
    protected array $masterData;

    public function __construct(array $masterData)
    {
        $this->masterData = $masterData;
    }

    public function bab1()
    {
        return (new Bab1Report())->generate($this->masterData);
    }

    public function bab2()
    {
        return (new Bab2Report())->generate($this->masterData);
    }

    public function bab3()
    {
        return (new Bab3Report())->generate($this->masterData);
    }

    public function bab4()
    {
        return (new Bab4Report())->generate($this->masterData);
    }

    public function bab5()
    {
        return (new Bab5Report())->generate($this->masterData);
    }

    public function bab6()
    {
        return (new Bab6Report())->generate($this->masterData);
    }

    public function bab7()
    {
        return (new Bab7Report())->generate($this->masterData);
    }

    public function bab8()
    {
        return (new Bab8Report())->generate($this->masterData);
    }

    /**
     * Menghasilkan seluruh laporan dalam satu array.
     */
    public function generate()
    {
        return [

            'bab1' => $this->bab1(),

            'bab2' => $this->bab2(),

            'bab3' => $this->bab3(),

            'bab4' => $this->bab4(),

            'bab5' => $this->bab5(),

            'bab6' => $this->bab6(),

            'bab7' => $this->bab7(),

            'bab8' => $this->bab8(),

        ];
    }
}
