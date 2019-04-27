<template>
  <div class="content">
    <div class="container">
      <div class="Search__container">
        <input
          v-model="package"
          class="Search__input"
          @keyup.enter="requestData"
          placeholder="npm package name"
          type="search" name="search"
        >
        <button class="Search__button" @click="requestData">Find</button>
        
      </div>
      <div class="Search__settings" v-if="showSettings">
        <datepicker input-class="Search__input" placeholder="Start Date" v-model="periodStart" name="start-date" v-on:selected="validateDataRequest()"></datepicker>
        <datepicker input-class="Search__input" placeholder="End Date" v-model="periodEnd" name="end-date" v-on:selected="validateDataRequest()"></datepicker>
      </div>

      <div class="error-message" v-if="showError">
       {{ errorMessage }}
      </div>
      <hr>
      <div v-if="loading" class="loading">
        🔧  Building Charts ...
        <div class="sk-cube-grid">
        <div class="sk-cube sk-cube1"></div>
        <div class="sk-cube sk-cube2"></div>
        <div class="sk-cube sk-cube3"></div>
        <div class="sk-cube sk-cube4"></div>
        <div class="sk-cube sk-cube5"></div>
        <div class="sk-cube sk-cube6"></div>
        <div class="sk-cube sk-cube7"></div>
        <div class="sk-cube sk-cube8"></div>
        <div class="sk-cube sk-cube9"></div>
      </div>
      </div>

      <package-info :package-name="packageName" :total-downloads="totalDownloads" :period="formattedPeriod" v-if="loaded"/>
      <div class="Chart__container" v-if="loaded">
        <div class="Chart__title">
          <h2>Downloads per Day <span>{{ formattedPeriod }}</span></h2>
          <DownloadButton :name="packageName + '-daily'" :link="dailyPng"/>
        </div>
        <hr>
        <div class="Chart__content">
          <line-chart chart-id="line-daily" v-if="loaded" :chart-data="downloads" :chart-labels="labels" @generate="setDailyPng"/>
        </div>
      </div>

      <div class="Chart__container" v-if="loaded">
        <div class="Chart__title">
          <h2>Downloads per Week <span>{{ formattedPeriod }}</span></h2>
          <DownloadButton :name="packageName + '-weekly'" :link="weeklyPng"/>
        </div>
        <hr>
        <div class="Chart__content">
          <line-chart chart-id="line-weekly" v-if="loaded" :chart-data="downloadsWeek" :chart-labels="labelsWeek" @generate="setWeeklyPng"/>
        </div>
      </div>

      <div class="Chart__container" v-if="loaded">
        <div class="Chart__title">
          <h2>Downloads per Month <span>{{ formattedPeriod }}</span></h2>
          <DownloadButton :name="packageName + '-monthly'" :link="monthlyPng"/>
        </div>
        <hr>
        <div class="Chart__content">
          <line-chart v-if="loaded" chart-id="line-monthly" :chart-data="downloadsMonth" :chart-labels="labelsMonth" @generate="setMonthlyPng"/>
        </div>
      </div>

      <div class="Chart__container" v-if="loaded">
        <div class="Chart__title">
          <h2>Downloads per Year <span>{{ formattedPeriod }}</span></h2>
          <DownloadButton :name="packageName + '-yearly'" :link="yearlyPng"/>
        </div>
        <hr>
        <div class="Chart__content">
          <bar-chart v-if="loaded" chart-id="bar-yearly" :chart-data="downloadsYear" :chart-labels="labelsYear" @generate="setYearlyPng"/>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
  import axios from 'axios'
  import Datepicker from 'vuejs-datepicker'
  import LineChart from '@/components/LineChart'
  import BarChart from '@/components/BarChart'
  import PackageInfo from '@/components/PackageInfo'
  import DownloadButton from '@/components/Download'
  import {
    dateToYear,
    dateToMonth,
    dateToWeek,
    dateToDay,
    dateBeautify
  } from '../utils/dateFormatter'
  import { removeDuplicate, groupData } from '../utils/downloadFormatter.js'
  export default {
    components: {
      LineChart,
      BarChart,
      PackageInfo,
      Datepicker,
      DownloadButton
    },
    metaInfo () {
      return {
        title: this.packageName ? `${this.packageName} | 📈 npm-stats` : '📈 npm-stats | Download statistics for your npm packages',
        meta: [
          { vmid: 'description', name: 'description', content: 'View your npm package download statistics with beautiful charts' }
        ]
      }
    },
    data () {
      return {
        package: '',
        packageName: '',
        loaded: false,
        loading: false,
        downloads: [],
        downloadsYear: [],
        downloadsMonth: [],
        downloadsWeek: [],
        labels: [],
        labelsYear: [],
        labelsMonth: [],
        labelsWeek: [],
        showError: false,
        showSettings: false,
        errorMessage: 'Please enter a package name',
        periodStart: '',
        periodEnd: new Date(),
        rawData: '',
        totalDownloads: '',
        dailyPng: null,
        weeklyPng: null,
        monthlyPng: null,
        yearlyPng: null
      }
    },
    mounted () {
      if (this.$route.params.package) {
        this.package = this.$route.params.package
        this.requestData()
      }
    },
    computed: {
      metaHeadTitle () {
        return this.packageName
          ? `📈 npm-stats for ${this.packageName}`
          : `📈 npm-stats`
      },
      _endDate () {
        return dateToDay(this.periodEnd)
      },
      _startDate () {
        return dateToDay(this.periodStart)
      },
      period () {
        return this.periodStart ? `${this._startDate}:${this._endDate}` : 'last-month'
      },
      formattedPeriod () {
        return this.periodStart ? `${dateBeautify(this._startDate)} - ${dateBeautify(this._endDate)}` : 'last-month'
      }
    },
    methods: {
      resetState () {
        this.loaded = false
        this.showError = false
      },
      requestData () {
        if (this.package === null || this.package === '' || this.package === 'undefined') {
          this.showError = true
          this.loading = false
          return
        }
        this.resetState()
        this.loading = true
        axios.get(`https://api.npmjs.org/downloads/range/${this.period}/${this.package}`)
          .then(response => {
            this.rawData = response.data.downloads
            this.downloads = response.data.downloads.map(entry => entry.downloads)
            this.labels = response.data.downloads.map(entry => entry.day)
            this.packageName = response.data.package
            this.totalDownloads = this.downloads.reduce((total, download) => total + download)
            this.setURL()
            this.groupDataByDate()
            this.loaded = true
            this.loading = false
          })
          .catch(err => {
            this.errorMessage = err.response.data.error
            this.showError = true
            this.loading = false
          })
      },
      validateDataRequest () {
        if (this.packageName !== '' && this.periodStart !== '') {
          this.requestData()
        }
      },
      groupDataByDate () {
        this.formatYear()
        this.formatMonth()
        this.formatWeek()
      },
      formatYear () {
        this.labelsYear = this.rawData
          .map(entry => dateToYear(entry.day))
          .reduce(removeDuplicate, [])
        this.downloadsYear = groupData(this.rawData, dateToYear)
      },
      formatMonth () {
        this.labelsMonth = this.rawData
          .map(entry => dateToMonth(entry.day))
          .reduce(removeDuplicate, [])
        this.downloadsMonth = groupData(this.rawData, dateToMonth)
      },
      formatWeek () {
        this.labelsWeek = this.rawData
          .map(entry => dateToWeek(entry.day))
          .reduce(removeDuplicate, [])
        this.downloadsWeek = groupData(this.rawData, dateToWeek)
      },
      setURL () {
        this.$router.push({
          name: 'Package',
          params: {
            package: this.package
          }
        })
      },
      toggleSettings () {
        this.showSettings = !this.showSettings
      },
      setDailyPng (payload) {
        this.dailyPng = payload
      },
      setWeeklyPng (payload) {
        this.weeklyPng = payload
      },
      setMonthlyPng (payload) {
        this.monthlyPng = payload
      },
      setYearlyPng (payload) {
        this.yearlyPng = payload
      }
    }
  }
</script>

<style lang="scss">
  
  hr {
    display: block;
    height: 1px;
    border: 0;
    border-top: 1px solid color(solitude);
    margin: 1em 0;
    padding: 0;
  }
  .content {
    background: color(ghost-white);
    min-height: calc(100vh - 207px);
  }
  .title {
    text-align: center;
    color: color(fjord);
  }
  
  .loading {
    text-align: center;
    color: color(fjord);
    font-size: rem(18);
  }
  .error-message {
    text-align: center;
    color: color(robin-egg-blue);
  }
  .container{
    display: flex 10em;
    flex-direction:column;
    flex-shrink: 2
  }
  .Chart__container {
    border-radius: 2px;
    background-color: #fff;
    box-shadow: 0 15px 30px 0 rgba(0,0,0,.11), 0 5px 15px 0 rgba(0,0,0,.08);
    padding: rem(1) rem(1);
    margin: rem(1) 0;
  }
  .Chart__title {
    display: flex;
    flex-direction: row;
    margin-bottom: rem(1);
    justify-content: space-between;
   
  }
  .Chart_title  h2 {
      display: flex;
      align-items: center;
      color: color(fjord);
      margin: 0;
      font-weight: 600;
      font-size: rem(16);
      
    }
    .Chart_title h2 > span {
        font-weight: 400;
        color: color(robin-egg-blue);
        font-size: rem(16);
        margin-left: rem(25);
      }
  .sk-cube-grid {
    width: 40px;
    height: 40px;
    margin: 100px auto;
  }
  .sk-cube-grid .sk-cube {
    width: 33%;
    height: 33%;
    background-color: color(robin-egg-blue);
    float: left;
    -webkit-animation: sk-cubeGridScaleDelay 1.3s infinite ease-in-out;
            animation: sk-cubeGridScaleDelay 1.3s infinite ease-in-out;
  }
  .sk-cube-grid .sk-cube1 {
    -webkit-animation-delay: 0.2s;
            animation-delay: 0.2s; }
  .sk-cube-grid .sk-cube2 {
    -webkit-animation-delay: 0.3s;
            animation-delay: 0.3s; }
  .sk-cube-grid .sk-cube3 {
    -webkit-animation-delay: 0.4s;
            animation-delay: 0.4s; }
  .sk-cube-grid .sk-cube4 {
    -webkit-animation-delay: 0.1s;
            animation-delay: 0.1s; }
  .sk-cube-grid .sk-cube5 {
    -webkit-animation-delay: 0.2s;
            animation-delay: 0.2s; }
  .sk-cube-grid .sk-cube6 {
    -webkit-animation-delay: 0.3s;
            animation-delay: 0.3s; }
  .sk-cube-grid .sk-cube7 {
    -webkit-animation-delay: 0s;
            animation-delay: 0s; }
  .sk-cube-grid .sk-cube8 {
    -webkit-animation-delay: 0.1s;
            animation-delay: 0.1s; }
  .sk-cube-grid .sk-cube9 {
    -webkit-animation-delay: 0.2s;
            animation-delay: 0.2s; }
  @-webkit-keyframes sk-cubeGridScaleDelay {
    0%, 70%, 100% {
      -webkit-transform: scale3D(1, 1, 1);
              transform: scale3D(1, 1, 1);
    } 35% {
      -webkit-transform: scale3D(0, 0, 1);
              transform: scale3D(0, 0, 1);
    }
  }
  @keyframes sk-cubeGridScaleDelay {
    0%, 70%, 100% {
      -webkit-transform: scale3D(1, 1, 1);
              transform: scale3D(1, 1, 1);
    } 35% {
      -webkit-transform: scale3D(0, 0, 1);
              transform: scale3D(0, 0, 1);
    }
	}
	</style>