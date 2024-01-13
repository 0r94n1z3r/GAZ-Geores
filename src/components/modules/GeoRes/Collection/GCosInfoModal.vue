<template>
    <InfoModal 
        ref="modal" 
        title="
            Общая вероятность геологического успеха определяется по формуле
        "
    >   
        <div class="content" ref="formula">
            <div class="formula">
                <VueLatex expression="{\large gCos = P_{нп} \cdot P_м \cdot P_к \cdot P_л \cdot P_с}" :strict="false"/>
            </div>
            <div class="legend">
                <div class="item" v-for="(i,k) in legend[0]" :key="k">
                    <VueLatex class="icon" :expression="`{\\large ${i.val} }`" :strict="false"/>
                    - {{i.descr}}
                </div>
            </div>
            <h2>Значения вероятности присутствия геологического признака:</h2>
            <div class="legend legend-long">
                <div class="item" v-for="(i,k) in legend[1]" :key="k">
                    <VueLatex class="icon" :expression="`{\\large ${i.val} }`" :strict="false"/>
                    - {{i.descr}}
                </div>
            </div>
        </div>
    </InfoModal>
</template>

<script setup>
    import { computed, onMounted, ref } from 'vue';

    import { VueLatex } from 'vatex'

    const legend = [
        [
            {val: 'P_{нп}', descr: 'Фактор наличия нефтегазоматеринской породы (Рнгмп), д.ед.'},
            {val: 'P_м', descr: 'Фактор наличия путей миграции УВС в ловушку (Рм), д.ед.'},
            {val: 'P_к', descr: 'Фактор наличия коллектора (Рк), д.ед.'},
            {val: 'P_л', descr: 'Фактор наличия ловушки (Рл), д.ед.'},
            {val: 'P_с', descr: 'Фактор сохранности залежи (Рс), д.ед'},
        ],
        [
            {val: 'P_i = 1', descr: 'наличие признака подтверждено прямыми фактами;'},
            {val: 'P_i = 0.5', descr: 'о наличии признака полностью отсутствует информация;'},
            {val: 'P_i = 0', descr: 'отсутствие признака подтверждено результатами непосредственных исследований;'},
        ]
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

            .icon{
                width: 33px;
                display: block;
                flex-shrink: 0;
            }
        }

        &-long{
            .item .icon{
                width: 82px;
            }
        }
    }

    h2{
        font-size: 20px;
        color: var(--bg-tone);
        margin: 20px 0 10px;
    }
</style>