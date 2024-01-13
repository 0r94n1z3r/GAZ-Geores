import { createApp } from 'vue'

import App from './App.vue'
const app = createApp(App)

//libs
    import { createPinia } from 'pinia'
    import router from './router'
    import VueApexCharts from "vue3-apexcharts";

    app.use(createPinia())
    app.use(router)
    app.use(VueApexCharts)

//components
    import VButton from '@/components/ui/VButton.vue';
    import VLoading from '@/components/ui/VLoading.vue';
    import VTextInput from '@/components/ui/VTextInput.vue';
    import TextSelect from '@/components/ui/TextSelect.vue';
    import VModal from '@/components/ui/VModal.vue';
    import IInfo from '@/components/icons/IInfo.vue';
    import InfoModal from '@/components/InfoModal.vue';

    app.component('VButton', VButton);
    app.component('VLoading', VLoading);
    app.component('VTextInput', VTextInput);
    app.component('TextSelect', TextSelect);
    app.component('VModal', VModal);
    app.component('IInfo', IInfo);
    app.component('InfoModal', InfoModal);


app.mount('#app');
