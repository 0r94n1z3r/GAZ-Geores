<template>
    <InfoModal 
        ref="modal" 
        title="
            При подсчете начальных геологических запасов газа используется
            формула, определенная в соответствии с Протоколом № 6 Заседания секций
            углеводородного сырья Экспертно-технического совета Государственной
            комиссии по запасам полезных ископаемых от 13 мая 2021 г.
        "
    >   
        <div class="content" ref="formula">
            <div class="formula">
                <VueLatex expression="{\large Q = F \cdot H \cdot K_п \cdot K_г} \cdot {\Large (\frac{P_0 \cdot a_0}{0.101325}) \cdot (\frac{293}{273 + T_{пл}})}" :strict="false"/>
            </div>
            <div class="legend">
                <div class="item" v-for="(i,k) in legend" :key="k">
                    <VueLatex class="icon" :expression="`{\\large ${i.val} }`" :strict="false"/>
                    <span>-</span> 
                    <span v-html="i.descr"></span>
                </div>
                
            </div>
        </div>
    </InfoModal>
</template>

<script setup>
    import { computed, onMounted, ref } from 'vue';

    import {VueLatex} from 'vatex'

    const legend = [
        {val: 'F', descr: ' площадь залежи (тыс. м²);'},
        {val: 'H', descr: ' эффективная газонасыщенная толщина (м);'},
        {val: 'K_п', descr: ' коэффициент открытой пористости (д. ед.);'},
        {val: 'K_г', descr: ' коэффициент газонасыщенности (д. ед.);'},
        {val: 'P_0', descr: ' начальное пластовое давление в залежи (МПа);'},
        {val: 'a_0', descr: ' поправка, обратно пропорциональная коэффициенту сжимаемости реальных газов Z<sub>0</sub>, соответствующая начальному пластовому давлению в залежи, равная 1/Z<sub>0</sub>'},
        {val: 'T_{пл}', descr: ' пластовая температура в залежи (°C).'},
    ]

        
    //call
        const modal = ref(); 
        const call = ()=>{
            modal.value.call();
        }
        const close = ()=>{
            modal.value.close();
        }
        defineExpose({
            call,
            close
        });
</script>

<style lang="scss" scoped>
    :deep(.modal){
        max-width: 740px!important;
    }

    .formula{
        @include flex-c;
        margin-bottom: 15px;
    }

    .legend {
        .item{
            display: flex;
            span{
                padding-left: .4em;
            }

            .icon{
                width: 33px;
                display: block;
                flex-shrink: 0;
            }
        }
    }
</style>